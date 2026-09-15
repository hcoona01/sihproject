import React from 'react';
import { Compass, AlertOctagon } from 'lucide-react';
import { MetricStats } from '../types/telemetry';
import { Sparkline } from './Sparkline';

interface DistancePanelProps {
  stats: MetricStats;
  lowThreshold?: number;
}

export const DistancePanel: React.FC<DistancePanelProps> = ({
  stats,
  lowThreshold = 30,
}) => {
  const { current, min, max, avg, delta, history, state } = stats;

  const isCollisionWarning = current !== null && current <= lowThreshold && current > lowThreshold / 2;
  const isCriticalHazard = current !== null && current <= lowThreshold / 2;

  const maxSensorRange = 250;
  const rangePercent = current !== null ? Math.min(Math.max((current / maxSensorRange) * 100, 2), 100) : 0;
  const accentColor = isCriticalHazard ? '#f2495c' : isCollisionWarning ? '#f2994a' : '#73bf69';

  return (
    <div className={`panel-card rounded-md overflow-hidden flex flex-col ${
      isCriticalHazard ? 'border-rose-500/80' : isCollisionWarning ? 'border-amber-500/80' : ''
    }`}>
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-200">OBSTACLE DISTANCE</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${
            state === 'connected' ? 'bg-emerald-400' : state === 'connecting' ? 'bg-amber-400' : 'bg-zinc-500'
          }`} />
          <span className="text-zinc-500 uppercase">{state}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        
        {/* Main readout & delta */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-mono font-bold tracking-tight ${
              current === null ? 'text-zinc-600' : isCriticalHazard ? 'text-rose-400' : isCollisionWarning ? 'text-amber-400' : 'text-zinc-100'
            }`}>
              {current !== null ? current.toFixed(0) : '---'}
            </span>
            <span className="text-sm font-mono text-zinc-400 font-medium">cm</span>
          </div>

          <div className="flex items-center gap-2">
            {delta !== null && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                delta < 0 ? 'bg-amber-950/70 text-amber-300' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {delta > 0 ? `+${delta}` : delta} cm
              </span>
            )}
            {(isCollisionWarning || isCriticalHazard) && (
              <span className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isCriticalHazard ? 'text-rose-400 bg-rose-950/60 border-rose-800/40' : 'text-amber-400 bg-amber-950/50 border-amber-800/40'
              }`}>
                <AlertOctagon className="w-3 h-3" />
                {isCriticalHazard ? 'HAZARD' : 'WARN'}
              </span>
            )}
          </div>
        </div>

        {/* Level bar */}
        <div className="h-1.5 w-full bg-[#131519] rounded overflow-hidden border border-[#22252b]">
          <div
            className={`h-full transition-all duration-300 ${
              isCriticalHazard ? 'bg-rose-500' : isCollisionWarning ? 'bg-amber-500' : 'bg-[#73bf69]'
            }`}
            style={{ width: `${rangePercent}%` }}
          />
        </div>

        {/* Sparkline */}
        <div className="w-full">
          <Sparkline data={history} color={accentColor} height={32} />
        </div>

        {/* Min / Avg / Max stats */}
        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-[#22252b] text-center font-mono text-[10px]">
          <div>
            <span className="text-zinc-500">MIN </span>
            <strong className="text-zinc-300">{min !== null ? `${min}cm` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">AVG </span>
            <strong className="text-emerald-300">{avg !== null ? `${avg}cm` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">MAX </span>
            <strong className="text-zinc-300">{max !== null ? `${max}cm` : '--'}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
