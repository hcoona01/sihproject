import React, { useState } from 'react';
import { Header } from './components/Header';
import { VideoViewport } from './components/VideoViewport';
import { TemperaturePanel } from './components/TemperaturePanel';
import { DistancePanel } from './components/DistancePanel';
import { HumidityPanel } from './components/HumidityPanel';
import { LedControlPanel } from './components/LedControlPanel';
import { TelemetryHistoryChart } from './components/TelemetryHistoryChart';
import { EventLogPanel } from './components/EventLogPanel';
import { SettingsModal } from './components/SettingsModal';
import { useRoverTelemetry } from './hooks/useRoverTelemetry';
import { loadConfig, saveConfig } from './config/api';
import { DashboardConfig } from './types/telemetry';

export const App: React.FC = () => {
  const [config, setConfig] = useState<DashboardConfig>(loadConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    stats,
    activeRoverId,
    overallState,
    logs,
    reconnectAll,
    clearHistory,
    clearLogs,
    addLog,
  } = useRoverTelemetry(config.backendBaseUrl, config.historyLimit);

  const handleSaveConfig = (newCfg: DashboardConfig) => {
    const updated = saveConfig(newCfg);
    setConfig(updated);
    addLog('SYSTEM', 'info', `Configuration updated: backend target set to ${updated.backendBaseUrl}`);
  };

  // Find the most recent update across any metric
  const lastUpdatedTimes = [
    stats.temp.lastUpdated?.getTime() ?? 0,
    stats.dist.lastUpdated?.getTime() ?? 0,
    stats.humd.lastUpdated?.getTime() ?? 0,
  ];
  const maxTimestamp = Math.max(...lastUpdatedTimes);
  const latestTelemetryDate = maxTimestamp > 0 ? new Date(maxTimestamp) : null;

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Station Command Header */}
      <Header
        roverId={activeRoverId}
        overallState={overallState}
        backendUrl={config.backendBaseUrl}
        onReconnect={reconnectAll}
        onClearHistory={clearHistory}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastUpdated={latestTelemetryDate}
      />

      {/* Main Mission Grid */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Top Split: Video Telemetry Viewport (Left) + Tactile Controls & Primary Gauges (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Video Telemetry Viewport (xl:col-span-7) */}
          <div className="xl:col-span-7 space-y-6 flex flex-col">
            <VideoViewport
              backendUrl={config.backendBaseUrl}
              roverId={activeRoverId}
              distAhead={stats.dist.current}
            />

            {/* Grafana-style multi-stream correlation timeline chart */}
            <TelemetryHistoryChart
              tempStats={stats.temp}
              distStats={stats.dist}
              humdStats={stats.humd}
            />
          </div>

          {/* Right: Tactical Command & Telemetry Panels (xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Rover LED Control Panel */}
            <LedControlPanel
              backendUrl={config.backendBaseUrl}
              roverId={activeRoverId}
              onLog={addLog}
            />

            {/* 3 Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              {/* Temperature (°C) */}
              <TemperaturePanel
                stats={stats.temp}
                highThreshold={config.highTempThreshold}
              />

              {/* Distance Ahead (cm) */}
              <DistancePanel
                stats={stats.dist}
                lowThreshold={config.lowDistThreshold}
              />

              {/* Atmospheric Humidity (% RH) */}
              <div className="md:col-span-2 xl:col-span-1">
                <HumidityPanel
                  stats={stats.humd}
                  highThreshold={config.highHumdThreshold}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Audit Log & Diagnostics */}
        <div className="w-full">
          <EventLogPanel logs={logs} onClearLogs={clearLogs} />
        </div>

      </main>

      {/* Station Footer */}
      <footer className="border-t border-slate-900 bg-[#080b12] py-4 px-6 text-xs font-mono text-slate-500">
        <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-semibold">ROVER TELEMETRY TERMINAL</span>
            <span className="text-slate-700">|</span>
            <span>ENDPOINTS: /temp, /dist, /humd, /video, /led</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>SSE PROTOCOL ACTIVE</span>
            </span>
            <span className="text-slate-700">•</span>
            <span>ZERO-POLLING REALTIME ARCHITECTURE</span>
          </div>
        </div>
      </footer>

      {/* Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />

    </div>
  );
};
