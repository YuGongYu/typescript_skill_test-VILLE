import { useState } from "react";
import type { SentimentPoint } from "../lib/types";

type Props = {
  series: SentimentPoint[];
  smoothing: number;
  onSmoothingChange: (value: number) => void;
  width?: number;
  height?: number;
  padding?: number;
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

function computeScales(points: SentimentPoint[], width: number, height: number, padding: number) {
  if (points.length === 0) {
    const identity = (n: number) => n;
    return { scaleX: identity, scaleY: identity, xMin: 0, xMax: 1, yMin: 0, yMax: 1, innerW: width, innerH: height };
  }
  const firstPoint = points[0]!;
  const lastPoint = points[points.length - 1]!;
  const xMin = +firstPoint.date;
  const xMax = +lastPoint.date;
  const yMinRaw = Math.min(...points.map((p) => p.avg));
  const yMaxRaw = Math.max(...points.map((p) => p.avg));
  const yPad = yMaxRaw === yMinRaw ? Math.max(1, Math.abs(yMaxRaw) || 1) : 0;
  const yMin = Math.min(yMinRaw, 0) - yPad * 0.1;
  const yMax = Math.max(yMaxRaw, 0) + yPad * 0.1;
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const scaleX = (t: number) => {
    if (xMax === xMin) return padding + innerW / 2;
    return padding + ((t - xMin) / (xMax - xMin)) * innerW;
  };
  const scaleY = (v: number) => {
    if (yMax === yMin) return padding + innerH / 2;
    return padding + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  };
  return { scaleX, scaleY, xMin, xMax, yMin, yMax, innerW, innerH };
}

function buildLinePath(points: SentimentPoint[], width: number, height: number, padding = 24): string {
  if (points.length === 0) return "";
  const firstPoint = points[0]!;
  const lastPoint = points[points.length - 1]!;
  const xMin = +firstPoint.date;
  const xMax = +lastPoint.date;
  const yMinRaw = Math.min(...points.map((p) => p.avg));
  const yMaxRaw = Math.max(...points.map((p) => p.avg));
  const yPad = yMaxRaw === yMinRaw ? Math.max(1, Math.abs(yMaxRaw) || 1) : 0;
  const yMin = Math.min(yMinRaw, 0) - yPad * 0.1;
  const yMax = Math.max(yMaxRaw, 0) + yPad * 0.1;
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const scaleX = (t: number) => {
    if (xMax === xMin) return padding + innerW / 2;
    return padding + ((t - xMin) / (xMax - xMin)) * innerW;
  };
  const scaleY = (v: number) => {
    if (yMax === yMin) return padding + innerH / 2;
    return padding + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  };
  let d = `M ${scaleX(+firstPoint.date)} ${scaleY(firstPoint.avg)}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    d += ` L ${scaleX(+p.date)} ${scaleY(p.avg)}`;
  }
  return d;
}

const OverallSentimentChart = ({
  series,
  smoothing,
  onSmoothingChange,
  width = 640,
  height = 240,
  padding = 32,
}: Props) => {
  const [hover, setHover] = useState<{ x: number; y: number; date: Date; value: number } | null>(null);

  const smoothed = movingAverage(series, smoothing);
  const { scaleX, scaleY, xMin, xMax, yMin, yMax, innerW, innerH } = computeScales(smoothed, width, height, padding);

  const xTicks = 5;
  const yTicks = 5;
  const xTickVals = new Array(xTicks + 1).fill(0).map((_, i) => xMin + ((xMax - xMin) * i) / xTicks);
  const yTickVals = new Array(yTicks + 1).fill(0).map((_, i) => yMin + ((yMax - yMin) * i) / yTicks);

  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h2 className="mb-3">Overall Sentiment Index</h2>
      <p className="text-inderes-gray mb-4">
        This line shows the overall daily average sentiment across all tracked companies. Hover the chart to
        see exact values for a day. Use the Smoothing control to apply a rolling average and reduce day-to-day noise.
      </p>
      <div className="flex items-center gap-3 flex-wrap my-2">
        <label htmlFor="smoothing" className="text-inderes-gray">Smoothing (days): </label>
        <select 
          id="smoothing" 
          className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-2 py-1.5"
          value={smoothing} 
          onChange={(e) => onSmoothingChange(parseInt(e.target.value))}
        >
          {[1, 3, 7, 14, 30].map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
      <svg width={width} height={height} role="img" aria-label="Overall Sentiment Index line chart">
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

        <rect
          x={padding}
          y={padding}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const toTime = (x: number) => {
              if (xMax === xMin) return xMin;
              const ratio = (x - padding) / innerW;
              return xMin + ratio * (xMax - xMin);
            };
            const targetTime = toTime(mouseX);
            let nearest = smoothed[0];
            let minDist = Infinity;
            for (const p of smoothed) {
              const d = Math.abs(+p!.date - targetTime);
              if (d < minDist) {
                minDist = d;
                nearest = p;
              }
            }
            if (nearest) {
              setHover({ x: scaleX(+nearest.date), y: scaleY(nearest.avg), date: nearest.date, value: nearest.avg });
            }
          }}
          onMouseLeave={() => setHover(null)}
        />

        <path d={buildLinePath(smoothed, width, height, padding)} stroke="#0051AD" fill="none" strokeWidth={2} />

        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={padding + innerH} stroke="#bbb" strokeDasharray="3 3" />
            <circle cx={hover.x} cy={hover.y} r={3} fill="#0070f3" />
            <rect x={hover.x + 6} y={hover.y - 22} rx={3} ry={3} width={120} height={20} fill="#fff" stroke="#E7E7E7" />
            <text x={hover.x + 10} y={hover.y - 8} fontSize={"11"} fill="#333">
              {hover.date.toISOString().slice(0, 10)} | {hover.value.toFixed(2)}
            </text>
          </g>
        )}
      </svg>
    </section>
  );
};

export default OverallSentimentChart;


