import React from 'react';
import { Droplets, CloudRain } from 'lucide-react';
import { MetricStats } from '../types/telemetry';
import { Sparkline } from './Sparkline';

interface HumidityPanelProps {
  stats: MetricStats;
  highThreshold?: number;
}

export const HumidityPanel: React.FC<HumidityPanelProps> = ({
  stats,
  highThreshold = 85,
}) => {
  const { current, min, max, avg, delta, history, state } = stats;

  const isHigh = current !== null && current >= highThreshold;
  const gaugePercent = current !== null ? Math.min(Math.max(current, 0), 100) : 0;

  return (
    <div className={`panel-card rounded-md overflow-hidden flex flex-col ${
      isHigh ? 'border-blue-500/80' : ''
    }`}>
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-zinc-200">HUMIDITY</span>
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
              current === null ? 'text-zinc-600' : isHigh ? 'text-blue-400' : 'text-zinc-100'
            }`}>
              {current !== null ? current.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm font-mono text-zinc-400 font-medium">% RH</span>
          </div>

          <div className="flex items-center gap-2">
            {delta !== null && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                delta > 0 ? 'bg-blue-950/70 text-blue-300' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {delta > 0 ? `+${delta}` : delta}%
              </span>
            )}
            {isHigh && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-800/40">
                <CloudRain className="w-3 h-3" />
                HIGH
              </span>
            )}
          </div>
        </div>

        {/* Level bar */}
        <div className="h-1.5 w-full bg-[#131519] rounded overflow-hidden border border-[#22252b]">
          <div
            className="h-full bg-[#5794f2] transition-all duration-300"
            style={{ width: `${gaugePercent}%` }}
          />
        </div>

        {/* Sparkline */}
        <div className="w-full">
          <Sparkline data={history} color="#5794f2" height={32} />
        </div>

        {/* Min / Avg / Max stats */}
        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-[#22252b] text-center font-mono text-[10px]">
          <div>
            <span className="text-zinc-500">MIN </span>
            <strong className="text-zinc-300">{min !== null ? `${min}%` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">AVG </span>
            <strong className="text-blue-300">{avg !== null ? `${avg}%` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">MAX </span>
            <strong className="text-zinc-300">{max !== null ? `${max}%` : '--'}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
