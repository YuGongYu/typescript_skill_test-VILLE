// Base domain types
export interface Company {
  standby?: boolean;
  title: string;
  tid: number;
  isin: string;
  id: number;
}

export interface Question {
  fullText: string;
  shortText: string;
  tag: string;
  id: string;
  isPublic?: boolean;
  isActive?: boolean;
  translations?: Record<string, Partial<Question>>;
}

export interface Answer {
  value: number;
  source: string;
  created: string;
  skip: boolean;
  id: string;
  user: string;
  company: Company;
  question: Question;
}

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


