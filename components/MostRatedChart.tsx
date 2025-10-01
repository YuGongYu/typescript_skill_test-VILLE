import type { MostRated } from "../lib/types";

type Props = { items: MostRated[] };

const MostRatedChart = ({ items }: Props) => {
  if (!items || items.length === 0) return null;
  const width = 680;
  const leftLabelW = 220;
  const rightPad = 24;
  const barH = 18;
  const rowH = 26;
  const topPad = 12;
  const bottomPad = 12;
  const height = topPad + bottomPad + items.length * rowH;
  const maxCount = Math.max(1, ...items.map((m) => m.count));
  const scaleX = (v: number) => (v / maxCount) * (width - leftLabelW - rightPad);

  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h2 className="mb-3">Most Rated Companies</h2>
      <p className="text-inderes-gray mb-4">
        This bar chart shows which companies received the most ratings within the selected date range. It highlights
        where user activity and attention have been concentrated.
      </p>
      <svg width={width} height={height} role="img" aria-label="Most rated companies bar chart">
        <rect x={0} y={0} width={width} height={height} fill="#fafafa" stroke="#E7E7E7" />
        {items.map((m, i) => {
          const y = topPad + i * rowH;
          const bw = scaleX(m.count);
          return (
            <g key={m.company.id} transform={`translate(0, ${y})`}>
              <text x={8} y={barH} fontSize={12} fill="#333" style={{ dominantBaseline: 'hanging' }}>
                {m.company.title}
              </text>
              <rect
                x={leftLabelW}
                y={(rowH - barH) / 2}
                width={bw}
                height={barH}
                fill="#0051AD"
                opacity={0.9}
              />
              <text x={leftLabelW + bw + 6} y={(rowH) / 2 + 3} fontSize={11} fill="#555">
                {m.count}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = Math.round((i / 4) * maxCount);
          const x = leftLabelW + scaleX(t);
          return (
            <g key={`xtick-${i}`}>
              <line x1={x} x2={x} y1={4} y2={height - 4} stroke="#eee" />
              <text x={x} y={height - 2} fontSize={10} textAnchor="middle" fill="#666">{t}</text>
            </g>
          );
        })}
      </svg>
    </section>
  );
};

export default MostRatedChart;


