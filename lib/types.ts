import type { Company } from "./schemas";

// UI/Component-specific types derived from base domain models

export type ScoredCompany = { company: Company; score: number };
export type SentimentPoint = { date: Date; avg: number };
export type SectorStat = { key: string; name: string; avg: number; count: number };
export type CompanyChange = {
  company: Company;
  delta: number;
  recentAvg: number;
  prevAvg: number;
  recentCount: number;
  prevCount: number;
};
export type MostRated = { company: Company; count: number };
export type SeriesBounds = { min: string | undefined; max: string | undefined };
export type AttributeStat = { tag: string; avg: number; count: number };


