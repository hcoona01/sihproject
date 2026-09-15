import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings as SettingsIcon, 
  Clock, 
  Cpu, 
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { StreamConnectionState } from '../types/telemetry';

interface HeaderProps {
  roverId: number | null;
  overallState: StreamConnectionState;
  backendUrl: string;
  onReconnect: () => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  lastUpdated: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  roverId,
  overallState,
  backendUrl,
  onReconnect,
  onClearHistory,
  onOpenSettings,
  lastUpdated,
}) => {
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);

  // Uptime session counter
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      setSessionTime(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time since last packet counter
  useEffect(() => {
    if (!lastUpdated) {
      setSecondsAgo(null);
      return;
    }
    const updateDiff = () => {
      const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff);
    };
    updateDiff();
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getStatusBadge = () => {
    switch (overallState) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-mono font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE TELEMETRY</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono font-medium tracking-wide">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>LINKING SSE...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs font-mono font-medium tracking-wide">
            <ShieldAlert className="w-3 h-3" />
            <span>LINK DEGRADED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded text-slate-400 text-xs font-mono font-medium tracking-wide">
            <WifiOff className="w-3 h-3" />
            <span>STANDBY</span>
          </div>
        );
    }
  };

  const displayRover = roverId ? `ROVER #${roverId}` : 'ROVER-01 (ACTIVE)';

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Station Identity & Rover Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider text-slate-100 uppercase">
                  ARES Ground Command
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate max-w-xs md:max-w-md">
                <span className="text-slate-500">HOST:</span>
                <span className="text-slate-300 font-mono truncate">{backendUrl.replace('https://', '')}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          {/* Active Rover ID Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200 tracking-wider">{displayRover}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-subtle"></span>
          </div>
        </div>

        {/* Right: Telemetry Clock, Health & Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Last packet status */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded border border-slate-800/60">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>SYNC:</span>
            {secondsAgo !== null ? (
              <span className={secondsAgo < 5 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {secondsAgo === 0 ? 'NOW' : `${secondsAgo}s ago`}
              </span>
            ) : (
              <span className="text-slate-500">AWAITING FEED</span>
            )}
          </div>

          {/* Mission Elapsed Time (MET) */}
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">MET:</span>
            <span className="font-semibold text-cyan-300 tracking-wider">{sessionTime}</span>
          </div>

          {/* Status Indicator Badge */}
          {getStatusBadge()}

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReconnect}
              title="Force Reconnect SSE Streams"
              className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClearHistory}
              title="Flush Rolling Telemetry Buffer"
              className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors focus:outline-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Station Settings & Endpoint Config"
              className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors focus:outline-none"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
