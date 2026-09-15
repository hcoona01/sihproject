export interface TelemetryPayload {
  data: number;
  rover_id: number;
}

export type StreamConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export type TelemetryMetricType = 'temp' | 'dist' | 'humd';

export interface TelemetryDataPoint {
  timestamp: number;
  value: number;
  rover_id: number;
}

export interface MetricStats {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  delta: number | null;
  lastUpdated: Date | null;
  history: TelemetryDataPoint[];
  state: StreamConnectionState;
  reconnectAttempts: number;
}

export interface RoverLedState {
  isOn: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  lastResponse: string | null;
  error: string | null;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  source: 'TEMP' | 'DIST' | 'HUMD' | 'VIDEO' | 'LED' | 'SYSTEM';
  message: string;
}

export interface DashboardConfig {
  backendBaseUrl: string;
  historyLimit: number;
  reconnectDelayMs: number;
  maxReconnectAttempts: number;
  highTempThreshold: number;
  lowDistThreshold: number;
  highHumdThreshold: number;
}
