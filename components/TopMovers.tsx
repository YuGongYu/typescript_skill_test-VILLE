import type { CompanyChange } from "../lib/types";

type Props = {
  topRisers: CompanyChange[];
  topFallers: CompanyChange[];
  windowDays: number;
  onWindowDaysChange: (value: number) => void;
};

const TopMovers = ({ topRisers, topFallers, windowDays, onWindowDaysChange }: Props) => {
  if ((!topRisers || topRisers.length === 0) && (!topFallers || topFallers.length === 0)) return null;
  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
      <h2 className="mb-3">Top Risers & Fallers</h2>
      <p className="text-inderes-gray mb-4">
        These tables rank companies by the change in average sentiment over the selected window compared to the
        previous window of equal length. Use the Window control to switch between short-term and longer-term moves.
      </p>
      <div className="mb-2 flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="windowDays" className="text-inderes-gray">Window (days): </label>
          <input
            id="windowDays"
            type="number"
            min={1}
            max={3650}
            value={windowDays}
            className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-2 py-1.5 w-20"
            onChange={(e) => {
              const v = parseInt(e.target.value || '0', 10);
              onWindowDaysChange(Number.isFinite(v) && v > 0 ? v : 7);
            }}
          />
          <button className="btn ml-2" onClick={() => onWindowDaysChange(7)}>7</button>
          <button className="btn" onClick={() => onWindowDaysChange(30)}>30</button>
        </div>
        <span className="text-gray-600">Using global end date; comparing averages vs previous window of equal length</span>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <h3>Top Risers</h3>
          <table className="w-full border-collapse bg-white border border-inderes-border-gray rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-inderes-blue-light">
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Company</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">ISIN</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Δ</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Recent</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Prev</th>
              </tr>
            </thead>
            <tbody>
              {topRisers.map((r, idx) => (
                <tr key={`riser-${r.company.id}`}>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topRisers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.company.title}</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topRisers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.company.isin}</td>
                  <td className={`px-3 py-2 font-semibold ${r.delta >= 0 ? 'text-inderes-green' : 'text-inderes-red'} ${idx < topRisers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{(r.delta >= 0 ? '+' : '') + r.delta.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topRisers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.recentAvg.toFixed(2)} ({r.recentCount})</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topRisers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.prevAvg.toFixed(2)} ({r.prevCount})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex-1 min-w-[300px]">
          <h3>Top Fallers</h3>
          <table className="w-full border-collapse bg-white border border-inderes-border-gray rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-inderes-blue-light">
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Company</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">ISIN</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Δ</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Recent</th>
                <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Prev</th>
              </tr>
            </thead>
            <tbody>
              {topFallers.map((r, idx) => (
                <tr key={`faller-${r.company.id}`}>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topFallers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.company.title}</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topFallers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.company.isin}</td>
                  <td className={`px-3 py-2 font-semibold ${r.delta >= 0 ? 'text-inderes-green' : 'text-inderes-red'} ${idx < topFallers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{(r.delta >= 0 ? '+' : '') + r.delta.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topFallers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.recentAvg.toFixed(2)} ({r.recentCount})</td>
                  <td className={`px-3 py-2 text-inderes-gray ${idx < topFallers.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{r.prevAvg.toFixed(2)} ({r.prevCount})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TopMovers;


