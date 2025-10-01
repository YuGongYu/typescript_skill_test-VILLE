import type { AttributeStat } from "../lib/types";
import { useMemo } from "react";

type Props = {
  items: AttributeStat[];
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  maxAbsValue?: number; // if provided, fixes the outer radius scale; otherwise derives from data
};

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = toRadians(angleDeg - 90);
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);
  return { x, y };
}

const AttributeRadarChart = ({ items, title = "Attribute Radar", description, width = 420, height = 360, maxAbsValue }: Props) => {
  if (!items || items.length === 0) return null;

  // Ensure stable ordering by tag
  const ordered = useMemo(() => items.slice().sort((a, b) => a.tag.localeCompare(b.tag)), [items]);
  const n = ordered.length;
  const padTop = 16;
  const padBottom = 24;
  const padSides = 16;
  const cx = width / 2;
  const cy = (height - padBottom + padTop) / 2;
  const radius = Math.max(40, Math.min(cx - padSides, cy - padTop));
  const maxValue = maxAbsValue ?? Math.max(1, ...ordered.map((i) => Math.abs(i.avg)));
  const scale = (v: number) => (maxValue === 0 ? 0 : (v / maxValue) * radius);

  const levelCount = 4;
  const levelRadii = Array.from({ length: levelCount }, (_, i) => ((i + 1) / levelCount) * radius);

  const angleStep = 360 / n;
  const axes = Array.from({ length: n }, (_, i) => i * angleStep);

  const points = ordered.map((it, i) => {
    const r = scale(it.avg);
    const { x, y } = polarToCartesian(cx, cy, r, axes[i]!);
    return { x, y };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';

  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h2 className="mb-3">{title}</h2>
      {description && <p className="text-inderes-gray mb-4">{description}</p>}
      <svg width={width} height={height} role="img" aria-label="Attribute radar chart">
        <rect x={0} y={0} width={width} height={height} fill="#fafafa" stroke="#E7E7E7" />

        {/* Concentric levels */}
        {levelRadii.map((r, idx) => (
          <circle key={`lvl-${idx}`} cx={cx} cy={cy} r={r} fill="none" stroke="#eee" />
        ))}

        {/* Axes and labels */}
        {ordered.map((it, i) => {
          const angle = axes[i]!;
          const end = polarToCartesian(cx, cy, radius, angle);
          const labelPoint = polarToCartesian(cx, cy, radius + 16, angle);
          const anchor = (() => {
            const deg = (angle % 360 + 360) % 360;
            if (deg === 0 || deg === 360) return 'middle';
            if (deg === 180) return 'middle';
            if (deg > 0 && deg < 180) return 'start';
            return 'end';
          })();
          return (
            <g key={`ax-${it.tag}`}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#ddd" />
              <text x={labelPoint.x} y={labelPoint.y} fontSize={11} textAnchor={anchor} fill="#333">
                {it.tag}
              </text>
            </g>
          );
        })}

        {/* Value polygon */}
        <path d={polygonPath} fill="rgba(0, 112, 243, 0.15)" stroke="#0051AD" strokeWidth={2} />

        {/* Value dots and tooltips (simple labels) */}
        {ordered.map((it, i) => {
          const r = scale(it.avg);
          const { x, y } = polarToCartesian(cx, cy, r, axes[i]!);
          return (
            <g key={`pt-${it.tag}`}>
              <circle cx={x} cy={y} r={3} fill="#0070f3" />
              <text x={x + 6} y={y - 6} fontSize={10} fill="#333">{it.avg.toFixed(2)}</text>
            </g>
          );
        })}

        {/* Legend for scale */}
        <text x={cx} y={cy + radius + 40} textAnchor="middle" fontSize={11} fill="#666">
          Scale ±{maxValue.toFixed(1)}
        </text>
      </svg>
    </section>
  );
};

export default AttributeRadarChart;


