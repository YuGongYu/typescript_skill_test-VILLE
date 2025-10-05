import type { Answer, Company, SentimentPoint, ScoredCompany } from "./types";

/**
 * Build daily sentiment series from answers by averaging values per day
 */
export function buildDailySentimentSeries(answers: Answer[]): SentimentPoint[] {
  const sums: Record<string, { total: number; count: number }> = {};
  for (const a of answers) {
    if (a.skip) continue;
    const d = new Date(a.created);
    const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      .toISOString()
      .slice(0, 10);
    if (!sums[key]) sums[key] = { total: 0, count: 0 };
    sums[key].total += a.value;
    sums[key].count += 1;
  }
  const points: SentimentPoint[] = Object.keys(sums)
    .map((k) => {
      const bucket = sums[k]!;
      return { date: new Date(k), avg: bucket.total / bucket.count };
    })
    .sort((a, b) => +a.date - +b.date);
  return points;
}

/**
 * Derive unique companies from answers array
 */
export function deriveCompaniesFromAnswers(answers: Answer[]): Company[] {
  const seen = new Set<string>();
  const companies: Company[] = [];
  for (const a of answers) {
    const isin = a.company.isin;
    if (seen.has(isin)) continue;
    seen.add(isin);
    companies.push({ ...a.company });
  }
  return companies;
}

/**
 * Compute top companies based on recent 6-month sentiment scores
 */
export function computeTopCompanies(companies: Company[], answers: Answer[]): ScoredCompany[] {
  const sampleCompanies = companies.slice(0, 5);
  const msMonth = 30 * 24 * 60 * 60 * 1000;
  const end = new Date();
  const start = new Date(+end - 6 * msMonth);
  const scores: ScoredCompany[] = sampleCompanies
    .map((c) => {
      const arr = answers
        .filter((a) => a.company.isin === c.isin)
        .filter((a) => !a.skip)
        .filter((a) => {
          const t = new Date(a.created);
          return t >= start && t < end;
        });
      const score = arr.length > 0 ? arr.reduce((s, a) => s + a.value, 0) / arr.length : undefined;
      return { company: c, score } as ScoredCompany;
    })
    .filter((s): s is ScoredCompany => typeof s.score === 'number' && !Number.isNaN(s.score));
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

/**
 * Get sector name for a company
 */
export function getSectorNameForCompany(
  company: Company, 
  dynamicMap: Record<number, string>,
  sectorByTid: Record<number, string> = {}
): { key: string; name: string } {
  const tid = company.tid;
  const name = dynamicMap[tid] ?? sectorByTid[tid] ?? `Group ${tid}`;
  return { key: String(tid), name };
}
