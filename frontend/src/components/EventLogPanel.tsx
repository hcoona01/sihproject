import React, { useState } from 'react';
import { Terminal, Pause, Play, Trash2 } from 'lucide-react';
import { TelemetryLogEntry } from '../types/telemetry';

interface EventLogPanelProps {
  logs: TelemetryLogEntry[];
  onClearLogs?: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({ logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level.toUpperCase() === filterLevel;
  });

  const getLevelBadge = (level: TelemetryLogEntry['level']) => {
    switch (level) {
      case 'success':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">OK</span>;
      case 'warn':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">WARN</span>;
      case 'error':
        return <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">FAIL</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">INFO</span>;
    }
  };

  return (
    <div className="flex flex-col bg-[#0b0f19] border border-slate-800/90 hover:border-slate-700/80 rounded-xl overflow-hidden shadow-xl h-full min-h-[300px]">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">EVENT AUDIT LOG</span>
          <span className="text-[10px] text-slate-500">({filteredLogs.length} EVENTS)</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center rounded bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
            {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterLevel === lvl ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Pause stream button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume live autoscroll' : 'Pause log view'}
            className={`p-1 rounded border text-[11px] transition-colors ${
              isPaused ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Clear logs button */}
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              title="Clear event logs"
              className="p-1 rounded border border-slate-700 bg-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Log list */}
      <div className="p-3 flex-1 overflow-y-auto font-mono text-xs space-y-1.5 max-h-[320px]">
        {filteredLogs.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-slate-500 text-xs italic">
            No telemetry events recorded yet.
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-900/60 transition-colors border border-transparent hover:border-slate-800/80"
            >
              <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                {item.timestamp.toTimeString().split(' ')[0]}.{String(item.timestamp.getMilliseconds()).padStart(3, '0')}
              </span>
              <span className="shrink-0">{getLevelBadge(item.level)}</span>
              <span className="text-[10px] px-1 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                {item.source}
              </span>
              <span className="text-slate-300 break-words leading-relaxed text-[11px]">
                {item.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 bg-slate-950/80 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>STATUS: {isPaused ? 'VIEW PAUSED' : 'AUTO-CAPTURING SSE EVENTS'}</span>
        <span>RETENTION: BUFFER CAP 60</span>
      </div>
    </div>
  );
};
