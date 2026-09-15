import React, { useState } from 'react';
import { LineChart, Eye, EyeOff, Layers } from 'lucide-react';
import { MetricStats, TelemetryDataPoint } from '../types/telemetry';

interface TelemetryHistoryChartProps {
  tempStats: MetricStats;
  distStats: MetricStats;
  humdStats: MetricStats;
}

export const TelemetryHistoryChart: React.FC<TelemetryHistoryChartProps> = ({
  tempStats,
  distStats,
  humdStats,
}) => {
  const [showTemp, setShowTemp] = useState(true);
  const [showDist, setShowDist] = useState(true);
  const [showHumd, setShowHumd] = useState(true);

  // Normalize data points across all 3 streams into a synchronized timeline
  // Collect all unique timestamps or use the longest history buffer
  const maxLen = Math.max(
    tempStats.history.length,
    distStats.history.length,
    humdStats.history.length
  );

  const width = 800;
  const height = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Helper to build normalized path for a metric series
  const buildSeriesPoints = (history: TelemetryDataPoint[], minVal: number, maxVal: number) => {
    if (history.length < 2) return '';
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    return history.map((pt, i) => {
      const x = padLeft + (i / (history.length - 1)) * chartW;
      const y = padTop + chartH - ((pt.value - minVal) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  // Find ranges
  const getRange = (history: TelemetryDataPoint[], defaultMin: number, defaultMax: number) => {
    if (history.length === 0) return { min: defaultMin, max: defaultMax };
    const vals = history.map((h) => h.value);
    return {
      min: Math.floor(Math.min(...vals)),
      max: Math.ceil(Math.max(...vals)),
    };
  };

  const tempRange = getRange(tempStats.history, 0, 80);
  const distRange = getRange(distStats.history, 0, 200);
  const humdRange = getRange(humdStats.history, 0, 100);

  const tempPoints = buildSeriesPoints(tempStats.history, tempRange.min, tempRange.max);
  const distPoints = buildSeriesPoints(distStats.history, distRange.min, distRange.max);
  const humdPoints = buildSeriesPoints(humdStats.history, humdRange.min, humdRange.max);

  return (
    <div className="flex flex-col bg-[#0b0f19] border border-slate-800/90 hover:border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            <LineChart className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">MULTI-STREAM CORRELATION TIMELINE</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">| GRAFANA-STYLE SYNCHRONIZED RUN</span>
        </div>

        {/* Series Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
              showTemp ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showTemp ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>TEMP (°C)</span>
          </button>

          <button
            onClick={() => setShowDist(!showDist)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
              showDist ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showDist ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>DIST (cm)</span>
          </button>

          <button
            onClick={() => setShowHumd(!showHumd)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
              showHumd ? 'bg-blue-950/70 border-blue-500/50 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showHumd ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>HUMD (%)</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="p-4 relative">
        {maxLen < 2 ? (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-lg text-slate-500 font-mono text-xs space-y-2">
            <Layers className="w-6 h-6 text-slate-600" />
            <span>BUFFERING MULTI-STREAM TELEMETRY DATA FROM BACKEND...</span>
          </div>
        ) : (
          <div className="w-full h-52 relative select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padTop + chartH * ratio;
                return (
                  <g key={ratio}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="var(--font-mono)"
                    >
                      {Math.round(100 * (1 - ratio))}%
                    </text>
                  </g>
                );
              })}

              {/* Time X Axis Base */}
              <line
                x1={padLeft}
                y1={padTop + chartH}
                x2={width - padRight}
                y2={padTop + chartH}
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Temp Series */}
              {showTemp && tempPoints && (
                <polyline
                  points={tempPoints}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dist Series */}
              {showDist && distPoints && (
                <polyline
                  points={distPoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Humd Series */}
              {showHumd && humdPoints && (
                <polyline
                  points={humdPoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        )}

        {/* Legend Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/70 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-cyan-400"></span>
              <span className="text-slate-400">TEMPERATURE:</span>
              <strong className="text-cyan-300">{tempStats.current !== null ? `${tempStats.current}°C` : '--'}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-emerald-400"></span>
              <span className="text-slate-400">DISTANCE:</span>
              <strong className="text-emerald-300">{distStats.current !== null ? `${distStats.current} cm` : '--'}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-400"></span>
              <span className="text-slate-400">HUMIDITY:</span>
              <strong className="text-blue-300">{humdStats.current !== null ? `${humdStats.current}%` : '--'}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            SAMPLING: SSE EVENT-DRIVEN (NON-POLLING)
          </div>
        </div>
      </div>
    </div>
  );
};
