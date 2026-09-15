import React from 'react';
import { Thermometer, ArrowUpRight, ArrowDownRight, AlertTriangle, Activity } from 'lucide-react';
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
  const { current, min, max, avg, delta, history, state, lastUpdated } = stats;

  const isWarning = current !== null && current >= highThreshold;
  const isCritical = current !== null && current >= highThreshold + 15;

  // Temperature gauge percentage (0°C to 100°C)
  const gaugePercent = current !== null ? Math.min(Math.max((current / 100) * 100, 0), 100) : 0;

  const getAccentColor = () => {
    if (isCritical) return '#f43f5e'; // rose-500
    if (isWarning) return '#f59e0b';  // amber-500
    return '#06b6d4';                 // cyan-500
  };

  return (
    <div className={`relative flex flex-col bg-[#0b0f19] border rounded-xl overflow-hidden shadow-lg transition-all ${
      isCritical 
        ? 'border-rose-500/60 shadow-rose-500/10' 
        : isWarning 
        ? 'border-amber-500/50 shadow-amber-500/10' 
        : 'border-slate-800/90 hover:border-slate-700/80'
    }`}>
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">CHASSIS TEMPERATURE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stream status indicator */}
          <span className={`w-2 h-2 rounded-full ${
            state === 'connected' ? 'bg-emerald-400' : state === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
          }`} />
          <span className="text-[11px] text-slate-400 uppercase font-mono">{state}</span>
        </div>
      </div>

      {/* Main Metric Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Value + Alert Banner */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Thermal Probe [Core]
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl lg:text-5xl font-mono font-bold tracking-tight ${
                current === null ? 'text-slate-600' : isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-100'
              }`}>
                {current !== null ? current.toFixed(1) : '--.-'}
              </span>
              <span className="text-xl font-mono text-cyan-400 font-semibold">°C</span>
            </div>
          </div>

          {/* Delta Pill */}
          {delta !== null && (
            <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border ${
              delta > 0 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : delta < 0 
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : delta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
              <span>{delta > 0 ? `+${delta}` : delta}°C</span>
            </div>
          )}
        </div>

        {/* Thermal Bar Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0°C</span>
            <span className={isWarning ? 'text-amber-400 font-semibold' : ''}>THRESH: {highThreshold}°C</span>
            <span>100°C</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical 
                  ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' 
                  : isWarning 
                  ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              }`}
              style={{ width: `${gaugePercent}%` }}
            />
          </div>
        </div>

        {/* Warning Callout if threshold exceeded */}
        {isWarning && (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>THERMAL WARNING: Elevated temperature detected on rover core</span>
          </div>
        )}

        {/* Sparkline Trend */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>TREND (ROLLING {history.length} PTS)</span>
            </span>
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'IDLE'}</span>
          </div>
          <Sparkline data={history} color={getAccentColor()} height={48} />
        </div>

        {/* Min / Max / Avg Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">MIN</div>
            <div className="text-xs font-semibold text-slate-200">{min !== null ? `${min}°C` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">AVG</div>
            <div className="text-xs font-semibold text-cyan-300">{avg !== null ? `${avg}°C` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">MAX</div>
            <div className="text-xs font-semibold text-slate-200">{max !== null ? `${max}°C` : '--'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
