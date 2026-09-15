import React, { useState } from 'react';
import { LineChart, Eye, EyeOff } from 'lucide-react';
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

  const maxLen = Math.max(
    tempStats.history.length,
    distStats.history.length,
    humdStats.history.length
  );

  const width = 700;
  const height = 150;
  const padLeft = 35;
  const padRight = 15;
  const padTop = 10;
  const padBottom = 20;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const buildSeriesPoints = (history: TelemetryDataPoint[], minVal: number, maxVal: number) => {
    if (history.length < 2) return '';
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    return history.map((pt, i) => {
      const x = padLeft + (i / (history.length - 1)) * chartW;
      const y = padTop + chartH - ((pt.value - minVal) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

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
    <div className="panel-card rounded-md overflow-hidden flex flex-col flex-1 min-h-[140px]">
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <LineChart className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200">TELEMETRY TIMELINE</span>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">| GRAFANA RUN</span>
        </div>

        {/* Series Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
              showTemp ? 'bg-[#22252b] border-[#f2994a]/60 text-[#f2994a]' : 'bg-[#181b1f] border-[#22252b] text-zinc-600'
            }`}
          >
            {showTemp ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span>TEMP</span>
          </button>

          <button
            onClick={() => setShowDist(!showDist)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
              showDist ? 'bg-[#22252b] border-[#73bf69]/60 text-[#73bf69]' : 'bg-[#181b1f] border-[#22252b] text-zinc-600'
            }`}
          >
            {showDist ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span>DIST</span>
          </button>

          <button
            onClick={() => setShowHumd(!showHumd)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
              showHumd ? 'bg-[#22252b] border-[#5794f2]/60 text-[#5794f2]' : 'bg-[#181b1f] border-[#22252b] text-zinc-600'
            }`}
          >
            {showHumd ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span>HUMD</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-2 flex-1 relative flex items-center justify-center">
        {maxLen < 2 ? (
          <div className="text-zinc-600 font-mono text-[11px] select-none">
            Awaiting streaming data points from SSE...
          </div>
        ) : (
          <div className="w-full h-full min-h-[90px] relative select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {[0, 0.5, 1].map((ratio) => {
                const y = padTop + chartH * ratio;
                return (
                  <line
                    key={ratio}
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#22252b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              <line
                x1={padLeft}
                y1={padTop + chartH}
                x2={width - padRight}
                y2={padTop + chartH}
                stroke="#2c323b"
                strokeWidth="1"
              />

              {showTemp && tempPoints && (
                <polyline
                  points={tempPoints}
                  fill="none"
                  stroke="#f2994a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {showDist && distPoints && (
                <polyline
                  points={distPoints}
                  fill="none"
                  stroke="#73bf69"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {showHumd && humdPoints && (
                <polyline
                  points={humdPoints}
                  fill="none"
                  stroke="#5794f2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Compact Legend Footer */}
      <div className="h-6 px-3 bg-[#16171c] border-t border-[#22252b] flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#f2994a]"></span>
            <span>TEMP: <strong className="text-zinc-300">{tempStats.current !== null ? `${tempStats.current}°C` : '--'}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#73bf69]"></span>
            <span>DIST: <strong className="text-zinc-300">{distStats.current !== null ? `${distStats.current}cm` : '--'}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#5794f2]"></span>
            <span>HUMD: <strong className="text-zinc-300">{humdStats.current !== null ? `${humdStats.current}%` : '--'}</strong></span>
          </span>
        </div>
        <div className="hidden sm:inline text-zinc-600">
          EVENT-DRIVEN SSE
        </div>
      </div>
    </div>
  );
};
