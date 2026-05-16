export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "analyst";
  org_id: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

// ── Market Data ───────────────────────────────────────────────────────────────

export interface PricePoint {
  date: string;
  close: number;
  volume: number;
}

export interface MarketData {
  ticker: string;
  company_name: string;
  sector?: string;
  industry?: string;
  current_price?: number;
  previous_close?: number;
  day_change_pct?: number;
  market_cap?: number;
  pe_ratio?: number;
  forward_pe?: number;
  eps?: number;
  revenue?: number;
  gross_margins?: number;
  profit_margins?: number;
  "52w_high"?: number;
  "52w_low"?: number;
  avg_volume?: number;
  beta?: number;
  dividend_yield?: number;
  history: PricePoint[];
  history_period: string;
  source: string;
  fetched_at: string;
  error?: string;
}

// ── News ──────────────────────────────────────────────────────────────────────

export type Sentiment = "positive" | "negative" | "neutral";

export interface NewsArticle {
  title: string;
  summary?: string;
  url: string;
  published_at: string;
  source: string;
  sentiment: Sentiment;
}

export interface NewsData {
  company: string;
  articles: NewsArticle[];
  sentiment_summary: {
    overall: Sentiment;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
  };
  source: string;
  days_searched: number;
}

// ── Knowledge Base ────────────────────────────────────────────────────────────

export interface FilingResult {
  doc_id: string;
  company: string;
  ticker: string;
  doc_type: string;
  title: string;
  excerpt: string;
  relevance_score: number;
  source: string;
}

export interface FilingsData {
  query: string;
  company?: string;
  results: FilingResult[];
  total_found: number;
  source: string;
}

// ── Research Report ───────────────────────────────────────────────────────────

export interface CompanyResearch {
  ticker: string;
  company_name: string;
  market_data?: MarketData | null;
  news?: NewsData | null;
  filings?: FilingsData | null;
}

export interface ResearchAnalysis {
  key_insights: string[];
  risk_factors: string[];
  opportunities: string[];
  competitive_landscape: string;
  overall_sentiment: Sentiment | "mixed";
}

export interface ReportData {
  title: string;
  executive_summary: string;
  companies: CompanyResearch[];
  analysis: ResearchAnalysis;
  tools_used: string[];
  sources: string[];
  generated_at: string;
  query?: string;
  error?: string;
}

export interface Report {
  id: string;
  query: string;
  title: string;
  report_data: ReportData;
  tags: string[];
  tickers: string;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  query: string;
  tags: string[];
  tickers: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  company_name: string;
  notes?: string;
  added_at: string;
}

export interface DashboardStats {
  total_reports: number;
  watchlist_companies: number;
}

export { default as Sidebar } from "./sidebar";