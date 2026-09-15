import React from 'react';
import { TelemetryDataPoint } from '../types/telemetry';

interface SparklineProps {
  data: TelemetryDataPoint[];
  color?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#3274d9',
  height = 36,
}) => {
  if (data.length < 2) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center border border-dashed border-[#22252b] rounded bg-[#131519] text-[10px] font-mono text-zinc-600"
      >
        <span>Buffer {data.length}/2</span>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const width = 260;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - paddingY - ((d.value - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(' ');
  const areaPoints = `${polylinePoints} ${width},${height} 0,${height}`;
  const gradientId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="w-full relative overflow-hidden select-none" style={{ height }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {points.length > 0 && (
          <circle
            cx={Number(points[points.length - 1].split(',')[0])}
            cy={Number(points[points.length - 1].split(',')[1])}
            r="2"
            fill="#ffffff"
            stroke={color}
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  );
};
