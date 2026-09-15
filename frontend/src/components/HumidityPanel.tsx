import React from 'react';
import { Droplets, ArrowUpRight, ArrowDownRight, Activity, CloudRain } from 'lucide-react';
import { MetricStats } from '../types/telemetry';
import { Sparkline } from './Sparkline';

interface HumidityPanelProps {
  stats: MetricStats;
  highThreshold?: number; // % RH
}

export const HumidityPanel: React.FC<HumidityPanelProps> = ({
  stats,
  highThreshold = 85,
}) => {
  const { current, min, max, avg, delta, history, state, lastUpdated } = stats;

  const isHigh = current !== null && current >= highThreshold;

  // Atmospheric status tag
  const getAtmosphereStatus = (val: number | null) => {
    if (val === null) return 'STANDBY';
    if (val < 30) return 'ARID / DRY';
    if (val <= 65) return 'OPTIMAL';
    if (val <= 85) return 'HIGH MOISTURE';
    return 'CONDENSATION RISK';
  };

  const gaugePercent = current !== null ? Math.min(Math.max(current, 0), 100) : 0;

  return (
    <div className={`relative flex flex-col bg-[#0b0f19] border rounded-xl overflow-hidden shadow-lg transition-all ${
      isHigh ? 'border-blue-500/60 shadow-blue-500/10' : 'border-slate-800/90 hover:border-slate-700/80'
    }`}>
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">ATMOSPHERIC HUMIDITY</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            state === 'connected' ? 'bg-emerald-400' : state === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
          }`} />
          <span className="text-[11px] text-slate-400 uppercase font-mono">{state}</span>
        </div>
      </div>

      {/* Main Metric Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Value + Delta */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Relative Moisture Index
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl lg:text-5xl font-mono font-bold tracking-tight ${
                current === null ? 'text-slate-600' : isHigh ? 'text-blue-400' : 'text-slate-100'
              }`}>
                {current !== null ? current.toFixed(1) : '--.-'}
              </span>
              <span className="text-xl font-mono text-blue-400 font-semibold">% RH</span>
            </div>
          </div>

          {/* Delta Pill */}
          {delta !== null && (
            <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border ${
              delta > 0 
                ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{delta > 0 ? `+${delta}` : delta}%</span>
            </div>
          )}
        </div>

        {/* Humidity Bar Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0%</span>
            <span className="text-blue-300 uppercase tracking-wider">{getAtmosphereStatus(current)}</span>
            <span>100%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-500"
              style={{ width: `${gaugePercent}%` }}
            />
          </div>
        </div>

        {/* High moisture callout */}
        {isHigh && (
          <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
            <CloudRain className="w-4 h-4 shrink-0 text-blue-400" />
            <span>ELEVATED MOISTURE: Condensation hazard on external lenses</span>
          </div>
        )}

        {/* Sparkline Trend */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>HUMIDITY TREND ({history.length} PTS)</span>
            </span>
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'IDLE'}</span>
          </div>
          <Sparkline data={history} color="#3b82f6" height={48} />
        </div>

        {/* Min / Max / Avg Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">LOWEST</div>
            <div className="text-xs font-semibold text-slate-200">{min !== null ? `${min}%` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">AVERAGE</div>
            <div className="text-xs font-semibold text-blue-300">{avg !== null ? `${avg}%` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">HIGHEST</div>
            <div className="text-xs font-semibold text-slate-200">{max !== null ? `${max}%` : '--'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
