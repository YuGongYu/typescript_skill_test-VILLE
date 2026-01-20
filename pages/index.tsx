import { useEffect, useMemo, useState } from "react";
import type { Company, Answer, ScoredCompany, SentimentPoint, SectorStat, CompanyChange, MostRated, SeriesBounds } from "../lib/types";
import DateRangeControls from "../components/DateRangeControls";
import OverallSentimentChart from "../components/OverallSentimentChart";
import SectorHeatmap from "../components/SectorHeatmap";
import TopMovers from "../components/TopMovers";
import TopCompaniesTable from "../components/TopCompaniesTable";
import MostRatedChart from "../components/MostRatedChart";
import Link from "next/link";
import type { GetStaticProps } from "next";
import {
  buildDailySentimentSeries,
  deriveCompaniesFromAnswers,
  computeTopCompanies,
  getSectorNameForCompany,
} from "../lib/utils";

// Optional mapping from company.tid to human-friendly sector names.
// If a tid is not present in this map, it will be labeled as "Group {tid}".
const sectorByTid: Record<number, string> = {};

interface HomeProps {
  companies: Company[];
  allAnswers: Answer[];
  sentimentSeriesData: Array<{ date: string; avg: number }>;
  topCompanies: ScoredCompany[];
  initialStartDate: string;
  initialEndDate: string;
}

// Static Site Generation - runs at build time
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const dataUrl = process.env.NEXT_PUBLIC_ANSWERS_DATA_URL || 
      'https://pub-143cbf8a3b5c4841983236dc7b36dab8.r2.dev/data.json.gz';
    
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error("Failed to load dataset");
    
    const allAnswers: Answer[] = await res.json();
    const companies = deriveCompaniesFromAnswers(allAnswers);
    const sentimentSeries = buildDailySentimentSeries(allAnswers);
    const topCompanies = computeTopCompanies(companies, allAnswers);

    // Initialize default date range to last 180 days
    const first = sentimentSeries[0]?.date;
    const last = sentimentSeries[sentimentSeries.length - 1]?.date;
    let initialStartDate = '';
    let initialEndDate = '';
    
    if (first && last) {
      const defaultStart = new Date(+last - 1000 * 60 * 60 * 24 * 180);
      const boundedStart = defaultStart < first ? first : defaultStart;
      initialStartDate = boundedStart.toISOString().slice(0, 10);
      initialEndDate = last.toISOString().slice(0, 10);
    }

    // Serialize dates to strings for JSON
    const sentimentSeriesData = sentimentSeries.map(p => ({
      date: p.date.toISOString(),
      avg: p.avg,
    }));

    return {
      props: {
        companies,
        allAnswers,
        sentimentSeriesData,
        topCompanies,
        initialStartDate,
        initialEndDate,
      },
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Return empty data on error - page will still render
    return {
      props: {
        companies: [],
        allAnswers: [],
        sentimentSeriesData: [],
        topCompanies: [],
        initialStartDate: '',
        initialEndDate: '',
      },
    };
  }
};

const Home = ({ companies, allAnswers, sentimentSeriesData, topCompanies, initialStartDate, initialEndDate }: HomeProps) => {
  // Convert serialized date strings back to Date objects
  const sentimentSeries: SentimentPoint[] = sentimentSeriesData.map(p => ({
    date: new Date(p.date),
    avg: p.avg,
  }));

  const [smoothing, setSmoothing] = useState<number>(7);
  const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);
  const [windowDays, setWindowDays] = useState<number>(7);
  const [sectorNameByTid, setSectorNameByTid] = useState<Record<number, string>>({});

  useEffect(() => {
    // Load optional sector name mapping from public/sectorNames.json
    fetch('/sectorNames.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSectorNameByTid(data as Record<number, string>);
        }
      })
      .catch(() => {
        // Best-effort only; fallback names will be used
      });
  }, []);

  const seriesBounds: SeriesBounds = useMemo(() => {
    const first = sentimentSeries[0]?.date;
    const last = sentimentSeries[sentimentSeries.length - 1]?.date;
    return {
      min: first ? first.toISOString().slice(0, 10) : undefined,
      max: last ? last.toISOString().slice(0, 10) : undefined,
    };
  }, [sentimentSeries]);

  const filteredSeries = useMemo(() => {
    if (sentimentSeries.length === 0) return [] as SentimentPoint[];
    const from = startDate ? new Date(startDate) : sentimentSeries[0]!.date;
    const to = endDate ? new Date(endDate) : sentimentSeries[sentimentSeries.length - 1]!.date;
    return sentimentSeries.filter((p) => p.date >= from && p.date <= to);
  }, [sentimentSeries, startDate, endDate]);

  const sectorStats = useMemo(() => {
    if (allAnswers.length === 0) return [] as SectorStat[];
    const from = startDate ? new Date(startDate) : undefined;
    const to = endDate ? new Date(endDate) : undefined;
    const sums: Record<string, { name: string; total: number; count: number }> = {};
    for (const a of allAnswers) {
      if (a.skip) continue;
      const t = new Date(a.created);
      if (from && t < from) continue;
      if (to && t > to) continue;
      const { key, name } = getSectorNameForCompany(a.company, sectorNameByTid, sectorByTid);
      if (!sums[key]) sums[key] = { name, total: 0, count: 0 };
      sums[key].total += a.value;
      sums[key].count += 1;
    }
    const stats: SectorStat[] = Object.entries(sums).map(([key, s]) => ({ key, name: s.name, avg: s.total / s.count, count: s.count }));
    stats.sort((a, b) => a.name.localeCompare(b.name));
    return stats;
  }, [allAnswers, startDate, endDate, sectorNameByTid]);

  const companyChanges = useMemo(() => {
    if (!companies || companies.length === 0 || allAnswers.length === 0) return [] as CompanyChange[];
    const msInDay = 24 * 60 * 60 * 1000;
    // Determine end date from UI selection or latest answer date
    const inferredEnd = (() => {
      if (endDate) return new Date(endDate);
      const latestTs = Math.max(...allAnswers.map((a) => +new Date(a.created)));
      return new Date(latestTs);
    })();
    const recentStart = new Date(+inferredEnd - windowDays * msInDay);
    const prevStart = new Date(+inferredEnd - 2 * windowDays * msInDay);

    const grouped: Record<string, Answer[]> = {};
    for (const a of allAnswers) {
      if (a.skip) continue;
      const t = new Date(a.created);
      if (t < prevStart || t > inferredEnd) continue;
      const k = a.company.isin;
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(a);
    }

    const out: CompanyChange[] = [];
    for (const isin of Object.keys(grouped)) {
      const arr = grouped[isin]!;
      if (arr.length === 0) continue;
      let recentSum = 0;
      let recentCount = 0;
      let prevSum = 0;
      let prevCount = 0;
      const company = arr[0]!.company;
      for (const a of arr) {
        const t = new Date(a.created);
        if (t >= recentStart && t <= inferredEnd) {
          recentSum += a.value;
          recentCount++;
        } else if (t >= prevStart && t < recentStart) {
          prevSum += a.value;
          prevCount++;
        }
      }
      if (recentCount > 0 && prevCount > 0) {
        const recentAvg = recentSum / recentCount;
        const prevAvg = prevSum / prevCount;
        const delta = recentAvg - prevAvg;
        out.push({ company, delta, recentAvg, prevAvg, recentCount, prevCount });
      }
    }
    return out;
  }, [allAnswers, companies, endDate, windowDays]);

  const topRisers = useMemo(() => {
    return [...companyChanges].sort((a, b) => b.delta - a.delta).slice(0, 10);
  }, [companyChanges]);

  const topFallers = useMemo(() => {
    return [...companyChanges].sort((a, b) => a.delta - b.delta).slice(0, 10);
  }, [companyChanges]);

  const mostRated = useMemo(() => {
    if (allAnswers.length === 0) return [] as MostRated[];
    const from = startDate ? new Date(startDate) : undefined;
    const to = endDate ? new Date(endDate) : undefined;

    const counts: Record<string, { company: Company; count: number }> = {};
    for (const a of allAnswers) {
      if (a.skip) continue;
      const t = new Date(a.created);
      if (from && t < from) continue;
      if (to && t > to) continue;
      const k = a.company.isin;
      if (!counts[k]) counts[k] = { company: a.company, count: 0 };
      counts[k]!.count += 1;
    }
    const list: MostRated[] = Object.values(counts);
    list.sort((a, b) => b.count - a.count || a.company.title.localeCompare(b.company.title));
    return list.slice(0, 10);
  }, [allAnswers, startDate, endDate]);

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
          <h1 className="text-4xl font-bold mb-3 uppercase">Market Overview</h1>
          <p className="text-inderes-gray text-lg">Sentiment and activity across tracked companies.</p>
        </div>

        {companies.length > 0 && (
            <section className="bg-inderes-lavender rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="mb-0">Browse Companies</h2>
                <span className="text-sm text-inderes-gray-dark bg-white px-3 py-1 rounded-full">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {companies
                  .slice()
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((c) => (
                    <Link key={c.id} href={`/companies/${encodeURIComponent(c.isin)}`}>
                      <div className="bg-white rounded-lg p-4 border border-inderes-border-gray hover:border-inderes-blue hover:shadow-md transition-all duration-200 cursor-pointer group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-inderes-blue transition-colors mb-1 truncate">
                              {c.title}
                            </h3>
                            <p className="text-xs text-inderes-gray-dark font-mono">
                              {c.isin}
                            </p>
                          </div>
                          <svg 
                            className="w-5 h-5 text-inderes-gray group-hover:text-inderes-blue group-hover:translate-x-1 transition-all flex-shrink-0" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}

          <DateRangeControls
            startDate={startDate}
            endDate={endDate}
            seriesBounds={seriesBounds}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
          {sentimentSeries.length > 0 && (
            <OverallSentimentChart
              series={filteredSeries}
              smoothing={smoothing}
              onSmoothingChange={setSmoothing}
            />
          )}

          {sectorStats.length > 0 && (
            <SectorHeatmap sectorStats={sectorStats} />
          )}

          {companyChanges.length > 0 && (
            <TopMovers
              topRisers={topRisers}
              topFallers={topFallers}
              windowDays={windowDays}
              onWindowDaysChange={setWindowDays}
            />
          )}

          {topCompanies.length > 0 && (
            <TopCompaniesTable items={topCompanies} />
          )}

          {mostRated.length > 0 && (
            <MostRatedChart items={mostRated} />
          )}
      </div>
    </div>
  );
};

export default Home;
