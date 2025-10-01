import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Answer, Company } from "../../lib/schemas";
import type { SentimentPoint, AttributeStat } from "../../lib/types";
import AttributeRadarChart from "../../components/AttributeRadarChart";
import HistoricalTrendsChart from "../../components/HistoricalTrendsChart";

function buildDailySentimentSeries(answers: Answer[]): SentimentPoint[] {
  const bucketByDay: Record<string, { total: number; count: number }> = {};
  for (const a of answers) {
    if (a.skip) continue;
    const d = new Date(a.created);
    const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      .toISOString()
      .slice(0, 10);
    if (!bucketByDay[key]) bucketByDay[key] = { total: 0, count: 0 };
    bucketByDay[key].total += a.value;
    bucketByDay[key].count += 1;
  }
  const points: SentimentPoint[] = Object.keys(bucketByDay)
    .map((k) => {
      const b = bucketByDay[k]!;
      return { date: new Date(k), avg: b.total / b.count };
    })
    .sort((a, b) => +a.date - +b.date);
  return points;
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { isin } = router.query as { isin?: string };

  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(undefined);
      try {
        if (!isin) return;
        // Fetch directly from R2 and filter client-side - avoids Edge function timeouts
        const dataUrl = process.env.NEXT_PUBLIC_ANSWERS_DATA_URL || 'https://pub-aabfd900efaf4039995d56f686bb2c79.r2.dev/data.json.gz';
        const res = await fetch(dataUrl);
        if (cancelled) return;
        if (!res.ok) throw new Error('Failed to fetch');
        const allAnswers: Answer[] = await res.json();
        // Filter by ISIN client-side
        const list = allAnswers.filter(a => a.company.isin === isin);
        setAnswers(list);
        const first = list[0]?.company;
        if (first) setCompany(first);
      } catch (_e) {
        if (!cancelled) setError('Failed to load company answers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isin]);

  const attributeStats: AttributeStat[] = useMemo(() => {
    if (!answers || answers.length === 0) return [] as AttributeStat[];
    const sums: Record<string, { total: number; count: number }> = {};
    for (const a of answers) {
      if (a.skip) continue;
      const tag = a.question.tag || 'Other';
      if (!sums[tag]) sums[tag] = { total: 0, count: 0 };
      sums[tag].total += a.value;
      sums[tag].count += 1;
    }
    return Object.keys(sums).map((tag) => ({ tag, avg: sums[tag]!.total / sums[tag]!.count, count: sums[tag]!.count }));
  }, [answers]);

  const overallDaily: SentimentPoint[] = useMemo(() => buildDailySentimentSeries(answers), [answers]);

  const tags = useMemo(() => attributeStats.map((s) => s.tag).sort((a, b) => a.localeCompare(b)), [attributeStats]);

  const seriesByTag = useMemo(() => {
    const map: Record<string, SentimentPoint[]> = {};
    // Bucket by day per tag
    const buckets: Record<string, Record<string, { total: number; count: number }>> = {};
    for (const a of answers) {
      if (a.skip) continue;
      const d = new Date(a.created);
      const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        .toISOString()
        .slice(0, 10);
      const tag = a.question.tag || 'Other';
      if (!buckets[tag]) buckets[tag] = {};
      if (!buckets[tag]![key]) buckets[tag]![key] = { total: 0, count: 0 };
      buckets[tag]![key]!.total += a.value;
      buckets[tag]![key]!.count += 1;
    }
    for (const tag of Object.keys(buckets)) {
      const dayMap = buckets[tag]!;
      const points: SentimentPoint[] = Object.keys(dayMap)
        .map((k) => {
          const b = dayMap[k]!;
          return { date: new Date(k), avg: b.total / b.count };
        })
        .sort((a, b) => +a.date - +b.date);
      map[tag] = points;
    }
    return map;
  }, [answers]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-inderes-blue px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-white font-bold text-xl cursor-pointer">inderes.</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white text-inderes-blue px-6 py-2 rounded-full font-semibold text-sm hover:bg-inderes-blue-sky transition-colors">
            Kirjaudu
          </button>
          <button className="text-white hover:opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="text-white hover:opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="text-white hover:opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold uppercase">{company?.title ?? (isin ? `Company ${isin}` : "Company")}</h1>
            <Link href="/">
              <button className="btn flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Main
              </button>
            </Link>
          </div>
          <p className="text-inderes-gray text-lg">ISIN: {isin ?? "-"}</p>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="w-16 h-16 border-4 border-inderes-border-gray border-t-inderes-blue rounded-full animate-spin"></div>
              {/* Inner pulsing dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-inderes-blue rounded-full animate-pulse"></div>
            </div>
            <p className="mt-6 text-inderes-gray font-medium">Loading company data…</p>
          </div>
        )}
        {error && <p className="text-inderes-red bg-inderes-red-bg p-4 rounded-lg">{error}</p>}
        {attributeStats.length > 0 && (
          <AttributeRadarChart
            items={attributeStats}
            title="Attribute Radar"
            description="Average score per question category based on all available answers."
          />
        )}

        {overallDaily.length > 0 && (
          <div className="bg-inderes-lavender rounded-lg p-6 mb-6">
            <div className="flex gap-3 items-center flex-wrap mb-4">
              <label htmlFor="tagSelect" className="text-inderes-gray font-medium">Add attribute:</label>
              <select
                id="tagSelect"
                className="border border-inderes-border-gray bg-white text-gray-900 rounded-md px-3 py-2"
                onChange={(e) => {
                  const t = e.target.value;
                  if (t && !selectedTags.includes(t)) setSelectedTags([...selectedTags, t]);
                }}
              >
                <option value="">-- Select tag --</option>
                {tags.filter((t) => !selectedTags.includes(t)).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {selectedTags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedTags.map((t) => (
                    <button key={t} className="btn" onClick={() => setSelectedTags(selectedTags.filter((x) => x !== t))}>
                      Remove {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <HistoricalTrendsChart
              series={[
                { key: 'overall', label: 'Overall', points: overallDaily },
                ...selectedTags.map((t) => ({ key: `tag-${t}`, label: t, points: seriesByTag[t] ?? [] })),
              ]}
              events={[]}
            />
          </div>
        )}
      </div>
    </div>
  );
}


