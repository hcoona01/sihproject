import React from 'react';
import { Compass, ArrowUpRight, ArrowDownRight, AlertOctagon, Radar } from 'lucide-react';
import { MetricStats } from '../types/telemetry';
import { Sparkline } from './Sparkline';

interface DistancePanelProps {
  stats: MetricStats;
  lowThreshold?: number; // cm warning threshold, e.g. 30cm
}

export const DistancePanel: React.FC<DistancePanelProps> = ({
  stats,
  lowThreshold = 30,
}) => {
  const { current, min, max, avg, delta, history, state, lastUpdated } = stats;

  const isCollisionWarning = current !== null && current <= lowThreshold && current > lowThreshold / 2;
  const isCriticalHazard = current !== null && current <= lowThreshold / 2;

  // Visual proximity scale: assuming max normal sensor range is around 250 cm
  const maxSensorRange = 250;
  const rangePercent = current !== null ? Math.min(Math.max((current / maxSensorRange) * 100, 5), 100) : 50;

  const getAccentColor = () => {
    if (isCriticalHazard) return '#f43f5e'; // rose
    if (isCollisionWarning) return '#f59e0b'; // amber
    return '#10b981'; // emerald
  };

  return (
    <div className={`relative flex flex-col bg-[#0b0f19] border rounded-xl overflow-hidden shadow-lg transition-all ${
      isCriticalHazard
        ? 'border-rose-500/70 shadow-rose-500/10'
        : isCollisionWarning
        ? 'border-amber-500/60 shadow-amber-500/10'
        : 'border-slate-800/90 hover:border-slate-700/80'
    }`}>
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">OBSTACLE DISTANCE</span>
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
              Forward LiDAR / Sonar Ahead
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl lg:text-5xl font-mono font-bold tracking-tight ${
                current === null ? 'text-slate-600' : isCriticalHazard ? 'text-rose-400' : isCollisionWarning ? 'text-amber-400' : 'text-slate-100'
              }`}>
                {current !== null ? current.toFixed(0) : '---'}
              </span>
              <span className="text-xl font-mono text-emerald-400 font-semibold">cm</span>
            </div>
          </div>

          {/* Delta Pill */}
          {delta !== null && (
            <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border ${
              delta < 0 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{delta > 0 ? `+${delta}` : delta} cm</span>
            </div>
          )}
        </div>

        {/* Proximity Range Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span className="text-rose-400">HAZARD (0)</span>
            <span>WARN (&lt;{lowThreshold}cm)</span>
            <span>CLEAR ({maxSensorRange}cm+)</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCriticalHazard
                  ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : isCollisionWarning
                  ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              }`}
              style={{ width: `${rangePercent}%` }}
            />
          </div>
        </div>

        {/* Proximity Alert Box */}
        {(isCollisionWarning || isCriticalHazard) && (
          <div className={`flex items-center gap-2 p-2 rounded text-xs font-mono border ${
            isCriticalHazard 
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 animate-pulse' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>
              {isCriticalHazard 
                ? 'COLLISION IMMINENT: Obstacle within emergency buffer zone!' 
                : 'PROXIMITY WARNING: Obstacle within caution envelope'}
            </span>
          </div>
        )}

        {/* Sparkline Trend */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Radar className="w-3 h-3 text-emerald-400" />
              <span>RANGE HISTORY ({history.length} PTS)</span>
            </span>
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'IDLE'}</span>
          </div>
          <Sparkline data={history} color={getAccentColor()} height={48} />
        </div>

        {/* Min / Max / Avg Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">CLOSEST</div>
            <div className="text-xs font-semibold text-slate-200">{min !== null ? `${min} cm` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">AVG DIST</div>
            <div className="text-xs font-semibold text-emerald-300">{avg !== null ? `${avg} cm` : '--'}</div>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
            <div className="text-[10px] text-slate-400">FARTHEST</div>
            <div className="text-xs font-semibold text-slate-200">{max !== null ? `${max} cm` : '--'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};
