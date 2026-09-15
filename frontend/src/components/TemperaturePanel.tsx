import React from 'react';
import { Thermometer, AlertTriangle } from 'lucide-react';
import { MetricStats } from '../types/telemetry';
import { Sparkline } from './Sparkline';

interface TemperaturePanelProps {
  stats: MetricStats;
  highThreshold?: number;
}

export const TemperaturePanel: React.FC<TemperaturePanelProps> = ({
  stats,
  highThreshold = 55,
}) => {
  const { current, min, max, avg, delta, history, state } = stats;

  const isWarning = current !== null && current >= highThreshold;
  const isCritical = current !== null && current >= highThreshold + 15;

  const gaugePercent = current !== null ? Math.min(Math.max((current / 100) * 100, 0), 100) : 0;
  const accentColor = isCritical ? '#f2495c' : isWarning ? '#f2994a' : '#f2994a';

  return (
    <div className={`panel-card rounded-md overflow-hidden flex flex-col ${
      isCritical ? 'border-rose-500/80' : isWarning ? 'border-amber-500/80' : ''
    }`}>
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">TEMPERATURE</span>
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
              current === null ? 'text-zinc-600' : isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-zinc-100'
            }`}>
              {current !== null ? current.toFixed(1) : '--.-'}
            </span>
            <span className="text-sm font-mono text-zinc-400 font-medium">°C</span>
          </div>

          <div className="flex items-center gap-2">
            {delta !== null && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                delta > 0 ? 'bg-amber-950/70 text-amber-300' : delta < 0 ? 'bg-blue-950/70 text-blue-300' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {delta > 0 ? `+${delta}` : delta}°C
              </span>
            )}
            {isWarning && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                <AlertTriangle className="w-3 h-3" />
                HIGH
              </span>
            )}
          </div>
        </div>

        {/* Level bar */}
        <div className="h-1.5 w-full bg-[#131519] rounded overflow-hidden border border-[#22252b]">
          <div
            className={`h-full transition-all duration-300 ${
              isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-amber-400'
            }`}
            style={{ width: `${gaugePercent}%` }}
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
            <strong className="text-zinc-300">{min !== null ? `${min}°` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">AVG </span>
            <strong className="text-amber-300">{avg !== null ? `${avg}°` : '--'}</strong>
          </div>
          <div>
            <span className="text-zinc-500">MAX </span>
            <strong className="text-zinc-300">{max !== null ? `${max}°` : '--'}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
