import { useMemo, useState } from "react";
import type { SentimentPoint } from "../lib/types";

type Series = {
  key: string;
  label: string;
  color?: string | undefined;
  points: SentimentPoint[];
  visible?: boolean;
};

type EventMarker = {
  date: Date;
  label: string;
};

type Props = {
  series: Series[];
  events?: EventMarker[];
  width?: number;
  height?: number;
  padding?: number;
  smoothing?: number; // rolling average window in days
  onSmoothingChange?: (value: number) => void;
};

function movingAverage(points: SentimentPoint[], windowSize: number): SentimentPoint[] {
  if (windowSize <= 1) return points;
  if (points.length === 0) return points;
  const sorted = [...points].sort((a, b) => +a.date - +b.date);
  const result: SentimentPoint[] = [];
  let sum = 0;
  const queue: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    sum += sorted[i]!.avg;
    queue.push(sorted[i]!.avg);
    if (queue.length > windowSize) sum -= queue.shift()!;
    const denom = Math.min(windowSize, queue.length);
    result.push({ date: sorted[i]!.date, avg: sum / denom });
  }
  return result;
}

function getExtent(series: Series[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of series) {
    for (const p of s.points) {
      const x = +p.date;
      const y = p.avg;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    const now = Date.now();
    minX = now - 1000 * 60 * 60 * 24 * 30;
    maxX = now;
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
    const pad = Math.max(1, Math.abs(maxY) || 1);
    minY = Math.min(minY, 0) - pad * 0.1;
    maxY = Math.max(maxY, 0) + pad * 0.1;
  }
  return { minX, maxX, minY, maxY };
}

function buildPath(points: SentimentPoint[], scaleX: (t: number) => number, scaleY: (v: number) => number) {
  if (!points || points.length === 0) return "";
  const sorted = [...points].sort((a, b) => +a.date - +b.date);
  let d = `M ${scaleX(+sorted[0]!.date)} ${scaleY(sorted[0]!.avg)}`;
  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i]!;
    d += ` L ${scaleX(+p.date)} ${scaleY(p.avg)}`;
  }
  return d;
}

const defaultPalette = [
  "#0070f3",
  "#00b36b",
  "#ff7a59",
  "#a855f7",
  "#ef4444",
  "#0ea5e9",
];

const HistoricalTrendsChart = ({
  series,
  events = [],
  width = 720,
  height = 280,
  padding = 32,
  smoothing = 7,
  onSmoothingChange,
}: Props) => {
  const [hover, setHover] = useState<{ x: number; y: number; date: Date } | null>(null);

  const coloredSeries = useMemo(() => {
    return series.map((s, i) => ({ ...s, color: s.color || defaultPalette[i % defaultPalette.length] }));
  }, [series]);

  const smoothedSeries = useMemo(() => {
    return coloredSeries.map((s) => ({ ...s, points: movingAverage(s.points, smoothing) }));
  }, [coloredSeries, smoothing]);

  const { minX, maxX, minY, maxY } = useMemo(() => getExtent(smoothedSeries), [smoothedSeries]);
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const scaleX = (t: number) => (maxX === minX ? padding + innerW / 2 : padding + ((t - minX) / (maxX - minX)) * innerW);
  const scaleY = (v: number) => (maxY === minY ? padding + innerH / 2 : padding + (1 - (v - minY) / (maxY - minY)) * innerH);

  const xTicks = 5;
  const yTicks = 5;
  const xTickVals = new Array(xTicks + 1).fill(0).map((_, i) => minX + ((maxX - minX) * i) / xTicks);
  const yTickVals = new Array(yTicks + 1).fill(0).map((_, i) => minY + ((maxY - minY) * i) / yTicks);

  return (
    <section>
      <h2 className="mb-3">Historical Sentiment Trends</h2>
      <div className="flex gap-3 items-center flex-wrap mb-4">
        <div>
          <label htmlFor="smoothingDays" className="text-inderes-gray">Smoothing (days): </label>
          <select 
            id="smoothingDays" 
            className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-2 py-1.5 ml-2"
            value={smoothing} 
            onChange={(e) => onSmoothingChange?.(parseInt(e.target.value, 10))}
          >
            {[1, 3, 7, 14, 30].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <span className="text-inderes-gray-dark">Toggle series in the legend.</span>
      </div>
      <svg width={width} height={height} role="img" aria-label="Historical sentiment trends chart">
        <rect x={0} y={0} width={width} height={height} fill="#fafafa" stroke="#E7E7E7" />

        {yTickVals.map((v, i) => (
          <line key={`yg-${i}`} x1={padding} x2={padding + innerW} y1={scaleY(v)} y2={scaleY(v)} stroke="#eee" />
        ))}
        {xTickVals.map((t, i) => (
          <line key={`xg-${i}`} y1={padding} y2={padding + innerH} x1={scaleX(t)} x2={scaleX(t)} stroke="#eee" />
        ))}

        <line x1={padding} x2={padding + innerW} y1={padding + innerH} y2={padding + innerH} stroke="#999" />
        <line x1={padding} x2={padding} y1={padding} y2={padding + innerH} stroke="#999" />

        {xTickVals.map((t, i) => (
          <g key={`xt-${i}`}>
            <line x1={scaleX(t)} x2={scaleX(t)} y1={padding + innerH} y2={padding + innerH + 4} stroke="#999" />
            <text x={scaleX(t)} y={padding + innerH + 16} textAnchor="middle" fontSize="10" fill="#666">
              {new Date(t).toISOString().slice(5, 10)}
            </text>
          </g>
        ))}
        {yTickVals.map((v, i) => (
          <g key={`yt-${i}`}>
            <line x1={padding - 4} x2={padding} y1={scaleY(v)} y2={scaleY(v)} stroke="#999" />
            <text x={padding - 6} y={scaleY(v) + 3} textAnchor="end" fontSize="10" fill="#666">
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Events overlay */}
        {events.map((e, i) => (
          <g key={`ev-${i}`}>
            <line x1={scaleX(+e.date)} x2={scaleX(+e.date)} y1={padding} y2={padding + innerH} stroke="#f59e0b" strokeDasharray="4 3" />
            <text x={scaleX(+e.date) + 4} y={padding + 12} fontSize={10} fill="#b45309">{e.label}</text>
          </g>
        ))}

        {/* Series paths */}
        {smoothedSeries.map((s) => (
          <path key={`path-${s.key}`} d={buildPath(s.points, scaleX, scaleY)} stroke={s.color} fill="none" strokeWidth={2} />
        ))}

        {/* Hover interaction */}
        <rect
          x={padding}
          y={padding}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const ratio = (mouseX - padding) / innerW;
            const targetTime = minX + ratio * (maxX - minX);
            let nearest: SentimentPoint | null = null;
            let minDist = Infinity;
            for (const s of smoothedSeries) {
              for (const p of s.points) {
                const d = Math.abs(+p.date - targetTime);
                if (d < minDist) {
                  minDist = d;
                  nearest = p;
                }
              }
            }
            if (nearest) setHover({ x: scaleX(+nearest.date), y: scaleY(nearest.avg), date: nearest.date });
          }}
          onMouseLeave={() => setHover(null)}
        />

        {smoothedSeries.map((s) => {
          if (!hover) return null;
          // Draw nearest point marker per series for the hover x
          let nearest: SentimentPoint | null = null;
          let minDist = Infinity;
          for (const p of s.points) {
            const d = Math.abs(+p.date - +hover.date);
            if (d < minDist) {
              minDist = d;
              nearest = p;
            }
          }
          if (!nearest) return null;
          return (
            <g key={`hover-${s.key}`}>
              <circle cx={scaleX(+nearest.date)} cy={scaleY(nearest.avg)} r={3} fill={s.color} />
            </g>
          );
        })}

        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={padding + innerH} stroke="#bbb" strokeDasharray="3 3" />
            <rect x={hover.x + 8} y={padding + 8} rx={4} ry={4} width={220} height={18 + 14 * smoothedSeries.length} fill="#fff" stroke="#E7E7E7" />
            <text x={hover.x + 12} y={padding + 22} fontSize={11} fill="#333">{hover.date.toISOString().slice(0, 10)}</text>
            {smoothedSeries.map((s, i) => {
              let nearest: SentimentPoint | null = null;
              let minDist = Infinity;
              for (const p of s.points) {
                const d = Math.abs(+p.date - +hover.date);
                if (d < minDist) {
                  minDist = d;
                  nearest = p;
                }
              }
              const val = nearest ? nearest.avg.toFixed(2) : '-';
              return (
                <g key={`hovrow-${s.key}`}>
                  <circle cx={hover.x + 12} cy={padding + 32 + i * 14 - 3} r={3} fill={s.color} />
                  <text x={hover.x + 20} y={padding + 32 + i * 14} fontSize={11} fill="#333">{s.label}: {val}</text>
                </g>
              );
            })}
          </g>
        )}

        {/* Legend */}
        <g>
          {smoothedSeries.map((s, i) => (
            <g key={`leg-${s.key}`} transform={`translate(${padding + i * 160}, ${padding - 10})`}>
              <rect x={0} y={-10} width={12} height={4} fill={s.color} />
              <text x={16} y={-6} fontSize={11} fill="#333">{s.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </section>
  );
};

export default HistoricalTrendsChart;


