import { useEffect, useRef, useState, useCallback } from 'react';
import { getStreamUrl } from '../config/api';
import { SseStreamManager } from '../services/sseClient';
import { MetricStats, StreamConnectionState, TelemetryDataPoint, TelemetryLogEntry, TelemetryPayload } from '../types/telemetry';

const MAX_LOGS = 60;

function createInitialMetricStats(): MetricStats {
  return {
    current: null,
    min: null,
    max: null,
    avg: null,
    delta: null,
    lastUpdated: null,
    history: [],
    state: 'disconnected',
    reconnectAttempts: 0,
  };
}

export function useRoverTelemetry(baseUrl: string, historyLimit = 40) {
  const [stats, setStats] = useState<{
    temp: MetricStats;
    dist: MetricStats;
    humd: MetricStats;
  }>({
    temp: createInitialMetricStats(),
    dist: createInitialMetricStats(),
    humd: createInitialMetricStats(),
  });

  const [activeRoverId, setActiveRoverId] = useState<number | null>(null);
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([]);

  // Refs for SSE Managers
  const tempManagerRef = useRef<SseStreamManager | null>(null);
  const distManagerRef = useRef<SseStreamManager | null>(null);
  const humdManagerRef = useRef<SseStreamManager | null>(null);

  const addLog = useCallback((source: TelemetryLogEntry['source'], level: TelemetryLogEntry['level'], message: string) => {
    const entry: TelemetryLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      level,
      source,
      message,
    };
    setLogs((prev) => [entry, ...prev.slice(0, MAX_LOGS - 1)]);
  }, []);

  const handleIncomingData = useCallback((type: 'temp' | 'dist' | 'humd', payload: TelemetryPayload) => {
    const now = Date.now();
    const point: TelemetryDataPoint = {
      timestamp: now,
      value: payload.data,
      rover_id: payload.rover_id,
    };

    if (payload.rover_id && payload.rover_id > 0) {
      setActiveRoverId(payload.rover_id);
    }

    setStats((prev) => {
      const currentMetric = prev[type];
      const newHistory = [...currentMetric.history, point].slice(-historyLimit);
      const values = newHistory.map((p) => p.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
      const prevVal = currentMetric.current;
      const delta = prevVal !== null ? Number((payload.data - prevVal).toFixed(1)) : null;

      return {
        ...prev,
        [type]: {
          ...currentMetric,
          current: payload.data,
          min,
          max,
          avg,
          delta,
          lastUpdated: new Date(now),
          history: newHistory,
        },
      };
    });
  }, [historyLimit]);

  // Stream initialization and lifecycle management
  useEffect(() => {
    const tempUrl = getStreamUrl(baseUrl, 'temp');
    const distUrl = getStreamUrl(baseUrl, 'dist');
    const humdUrl = getStreamUrl(baseUrl, 'humd');

    const tempMgr = new SseStreamManager(tempUrl, 'TEMP');
    const distMgr = new SseStreamManager(distUrl, 'DIST');
    const humdMgr = new SseStreamManager(humdUrl, 'HUMD');

    tempManagerRef.current = tempMgr;
    distManagerRef.current = distMgr;
    humdManagerRef.current = humdMgr;

    // Listeners for TEMP
    const unsubTempMsg = tempMgr.onMessage((p) => handleIncomingData('temp', p));
    const unsubTempState = tempMgr.onStateChange((state) => {
      setStats((prev) => ({
        ...prev,
        temp: { ...prev.temp, state, reconnectAttempts: tempMgr.getAttempts() },
      }));
    });
    const unsubTempLog = tempMgr.onLog((level, msg) => addLog('TEMP', level, msg));

    // Listeners for DIST
    const unsubDistMsg = distMgr.onMessage((p) => handleIncomingData('dist', p));
    const unsubDistState = distMgr.onStateChange((state) => {
      setStats((prev) => ({
        ...prev,
        dist: { ...prev.dist, state, reconnectAttempts: distMgr.getAttempts() },
      }));
    });
    const unsubDistLog = distMgr.onLog((level, msg) => addLog('DIST', level, msg));

    // Listeners for HUMD
    const unsubHumdMsg = humdMgr.onMessage((p) => handleIncomingData('humd', p));
    const unsubHumdState = humdMgr.onStateChange((state) => {
      setStats((prev) => ({
        ...prev,
        humd: { ...prev.humd, state, reconnectAttempts: humdMgr.getAttempts() },
      }));
    });
    const unsubHumdLog = humdMgr.onLog((level, msg) => addLog('HUMD', level, msg));

    // Initiate connections
    tempMgr.connect();
    distMgr.connect();
    humdMgr.connect();

    addLog('SYSTEM', 'info', `Station initializing SSE connections against ${baseUrl}`);

    return () => {
      unsubTempMsg();
      unsubTempState();
      unsubTempLog();
      tempMgr.disconnect();

      unsubDistMsg();
      unsubDistState();
      unsubDistLog();
      distMgr.disconnect();

      unsubHumdMsg();
      unsubHumdState();
      unsubHumdLog();
      humdMgr.disconnect();
    };
  }, [baseUrl, handleIncomingData, addLog]);

  const reconnectAll = useCallback(() => {
    addLog('SYSTEM', 'warn', 'Manual telemetry reconnect triggered');
    tempManagerRef.current?.reconnect();
    distManagerRef.current?.reconnect();
    humdManagerRef.current?.reconnect();
  }, [addLog]);

  const clearHistory = useCallback(() => {
    setStats({
      temp: createInitialMetricStats(),
      dist: createInitialMetricStats(),
      humd: createInitialMetricStats(),
    });
    addLog('SYSTEM', 'info', 'Telemetry history buffer cleared');
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Overall connection status:
  // If any are connected -> connected. If all disconnected -> disconnected. If any connecting -> connecting.
  const states = [stats.temp.state, stats.dist.state, stats.humd.state];
  let overallState: StreamConnectionState = 'disconnected';
  if (states.includes('connected')) {
    overallState = 'connected';
  } else if (states.includes('connecting')) {
    overallState = 'connecting';
  } else if (states.includes('error')) {
    overallState = 'error';
  }

  return {
    stats,
    activeRoverId,
    overallState,
    logs,
    reconnectAll,
    clearHistory,
    clearLogs,
    addLog,
  };
}
