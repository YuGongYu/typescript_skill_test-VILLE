import type { SectorStat } from "../lib/types";

type Props = { sectorStats: SectorStat[] };

function getHeatColor(value: number, minVal: number, maxVal: number) {
  if (!Number.isFinite(value)) return '#eee';
  if (minVal === maxVal) return '#ddd';
  const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal));
  const norm = (value + absMax) / (2 * absMax);
  const hue = 0 + (120 - 0) * norm;
  return `hsl(${hue}, 70%, 55%)`;
}

const SectorHeatmap = ({ sectorStats }: Props) => {
  if (!sectorStats || sectorStats.length === 0) return null;
  const avgs = sectorStats.map((s) => s.avg);
  const minAvg = Math.min(...avgs);
  const maxAvg = Math.max(...avgs);
  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h2 className="mb-3">Sector Heatmap</h2>
      <p className="text-inderes-gray mb-4">
        This grid compares average sentiment by sector within the selected date range. Colors run from red (lower)
        to green (higher) to quickly highlight which sectors are viewed more or less favorably.
      </p>
      <div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 max-w-4xl">
          {sectorStats.map((s) => (
            <div key={s.key} role="figure" aria-label={`${s.name}: ${s.avg.toFixed(1)} average from ${s.count} answers`} className="border border-inderes-border-gray rounded-md p-3 bg-white">
              <div className="h-14 rounded" style={{ background: getHeatColor(s.avg, minAvg, maxAvg) }} aria-hidden="true" />
              <div className="mt-2 flex justify-between items-baseline">
                <strong className="text-gray-900">{s.name}</strong>
                <span className="text-gray-600">{s.avg.toFixed(1)} ({s.count})</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-inderes-gray-dark">Lower</span>
          <div aria-hidden="true" className="h-2.5 w-52 rounded" style={{ background: 'linear-gradient(to right, hsl(0,70%,55%), hsl(60,70%,55%), hsl(120,70%,55%))' }} />
          <span className="text-xs text-inderes-gray-dark">Higher</span>
        </div>
      </div>
    </section>
  );
};

export default SectorHeatmap;


