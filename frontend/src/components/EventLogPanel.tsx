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
        return <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">OK</span>;
      case 'warn':
        return <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/70 text-amber-400 border border-amber-800/40">WARN</span>;
      case 'error':
        return <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950/70 text-rose-400 border border-rose-800/40">ERR</span>;
      default:
        return <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950/70 text-blue-400 border border-blue-800/40">INFO</span>;
    }
  };

  return (
    <div className="panel-card rounded-md overflow-hidden flex flex-col flex-1 min-h-[140px]">
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200">EVENT AUDIT LOG</span>
          <span className="text-[10px] text-zinc-500">({filteredLogs.length})</span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded bg-[#131519] p-0.5 border border-[#22252b] text-[9px]">
            {['ALL', 'INFO', 'WARN', 'ERR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl === 'ERR' ? 'ERROR' : lvl)}
                className={`px-1.5 py-0.2 rounded transition-colors ${
                  (filterLevel === lvl || (lvl === 'ERR' && filterLevel === 'ERROR')) 
                    ? 'bg-[#272b35] text-zinc-200 font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume scroll' : 'Pause'}
            className="p-1 rounded bg-[#1e2229] hover:bg-[#272b35] text-zinc-400 border border-[#2c323b] transition-colors"
          >
            {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              title="Clear log"
              className="p-1 rounded bg-[#1e2229] hover:bg-[#272b35] text-zinc-400 hover:text-rose-400 border border-[#2c323b] transition-colors"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log items container */}
      <div className="p-2 flex-1 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#131519]">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
            No events logged yet.
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-baseline gap-2 py-0.5 px-1 rounded hover:bg-[#181b21] transition-colors leading-tight"
            >
              <span className="text-zinc-500 text-[10px] shrink-0">
                {item.timestamp.toTimeString().split(' ')[0]}
              </span>
              <span className="shrink-0">{getLevelBadge(item.level)}</span>
              <span className="text-[10px] text-zinc-400 px-1 py-0 rounded bg-[#1a1d24] border border-[#262b35] shrink-0">
                {item.source}
              </span>
              <span className="text-zinc-300 break-all">
                {item.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="h-5 px-3 bg-[#16171c] border-t border-[#22252b] flex items-center justify-between text-[10px] font-mono text-zinc-600 shrink-0">
        <span>{isPaused ? 'LOG VIEW PAUSED' : 'AUTO-SCROLL ON'}</span>
        <span>RETENTION: 60 EVENTS</span>
      </div>
    </div>
  );
};
