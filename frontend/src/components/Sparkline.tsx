import React from 'react';
import { TelemetryDataPoint } from '../types/telemetry';

interface SparklineProps {
  data: TelemetryDataPoint[];
  color?: string; // hex or rgb
  height?: number;
  showMinMax?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#06b6d4',
  height = 56,
}) => {
  if (data.length < 2) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center border border-dashed border-slate-800/80 rounded bg-slate-900/30 text-[11px] font-mono text-slate-500"
      >
        <span>AWAITING STREAM BUFFER ({data.length}/2)...</span>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const width = 300;
  const paddingY = 8;
  const usableHeight = height - paddingY * 2;

  // Build points string
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - paddingY - ((d.value - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(' ');
  const areaPoints = `${polylinePoints} ${width},${height} 0,${height}`;
  const gradientId = `spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="w-full relative overflow-hidden select-none" style={{ height }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        <line x1="0" y1={paddingY} x2={width} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1={height - paddingY} x2={width} y2={height - paddingY} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

        {/* Filled Area */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Last data point ping */}
        {points.length > 0 && (
          <circle
            cx={Number(points[points.length - 1].split(',')[0])}
            cy={Number(points[points.length - 1].split(',')[1])}
            r="3"
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
};
