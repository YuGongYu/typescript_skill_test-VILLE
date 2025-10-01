import type { ScoredCompany } from "../lib/types";
import Link from "next/link";

type Props = { items: ScoredCompany[] };

const TopCompaniesTable = ({ items }: Props) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="bg-inderes-lavender rounded-lg p-6 mb-6 overflow-x-auto">
      <h2 className="mb-3">Top Companies (sample)</h2>
      <p className="text-inderes-gray mb-4">
        A small sample of companies with their current sentiment-based score. Higher scores indicate more favorable
        recent sentiment.
      </p>
      <table className="w-full border-collapse bg-white border border-inderes-border-gray rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-inderes-blue-light">
            <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Company</th>
            <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">ISIN</th>
            <th className="text-left px-3 py-2 border-b border-inderes-border-gray text-gray-900">Score</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ company, score }, idx) => (
            <tr key={company.id}>
              <td className={`px-3 py-2 ${idx < items.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>
                <Link href={`/companies/${encodeURIComponent(company.isin)}`}>
                  {company.title}
                </Link>
              </td>
              <td className={`px-3 py-2 text-inderes-gray ${idx < items.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{company.isin}</td>
              <td className={`px-3 py-2 text-inderes-gray ${idx < items.length - 1 ? 'border-b border-inderes-border-gray' : ''}`}>{score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default TopCompaniesTable;


