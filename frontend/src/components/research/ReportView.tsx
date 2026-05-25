"use client";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Target,
  Info,
  BarChart2,
  Newspaper,
  BookOpen,
  Globe,
} from "lucide-react";
import type { ReportData, MarketData, NewsData, FilingsData, Sentiment } from "@/components/layout/index";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import clsx from "clsx";

// ── Sentiment badge ───────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }: { sentiment: Sentiment | "mixed" }) {
  const map = {
    positive: { label: "Positive", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    negative: { label: "Negative", cls: "bg-red-50 text-red-600 border-red-200" },
    neutral:  { label: "Neutral",  cls: "bg-ink-50 text-ink-500 border-ink-200" },
    mixed:    { label: "Mixed",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  };
  const s = map[sentiment] ?? map.neutral;
  return (
    <span className={clsx("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", s.cls)}>
      {sentiment === "positive" && <TrendingUp size={9} />}
      {sentiment === "negative" && <TrendingDown size={9} />}
      {(sentiment === "neutral" || sentiment === "mixed") && <Minus size={9} />}
      {s.label}
    </span>
  );
}

// ── Source attribution pill ───────────────────────────────────────────────────
function SourcePill({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-ink-400 bg-ink-50 border border-ink-100 px-1.5 py-0.5 rounded font-medium">
      <Globe size={8} />
      {source}
    </span>
  );
}

// ── Change badge ──────────────────────────────────────────────────────────────
function ChangeBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={clsx(
        "tabnum inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded",
        up ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
      )}
    >
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────
function fmt(n?: number): string {
  if (n === undefined || n === null) return "—";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString();
}

// ── Stock Chart ───────────────────────────────────────────────────────────────
function StockChart({ data, ticker }: { data: MarketData["history"]; ticker: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center rounded-lg bg-ink-50">
        <span className="text-[11px] text-ink-400">No price history available</span>
      </div>
    );
  }

  const min = Math.min(...data.map((d) => d.close));
  const max = Math.max(...data.map((d) => d.close));
  const isUp = data[data.length - 1].close >= data[0].close;

  const chartData = data.map((d) => ({
    date: d.date,
    close: d.close,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[min * 0.98, max * 1.02]}
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, ticker]}
            labelStyle={{ color: "#6b7280", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={isUp ? "#059669" : "#ef4444"}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Metric grid ───────────────────────────────────────────────────────────────
function MetricGrid({ md }: { md: MarketData }) {
  const metrics = [
    { label: "Price",      value: md.current_price !== undefined ? `$${md.current_price?.toFixed(2)}` : "—" },
    { label: "Market Cap", value: fmt(md.market_cap) },
    { label: "P/E",        value: md.pe_ratio?.toFixed(1) ?? "—" },
    { label: "Fwd P/E",    value: md.forward_pe?.toFixed(1) ?? "—" },
    { label: "EPS",        value: md.eps !== undefined ? `$${md.eps?.toFixed(2)}` : "—" },
    { label: "Revenue",    value: fmt(md.revenue) },
    { label: "Gross Margin", value: md.gross_margins !== undefined ? `${(md.gross_margins * 100).toFixed(1)}%` : "—" },
    { label: "Beta",       value: md.beta?.toFixed(2) ?? "—" },
    { label: "52W High",   value: md["52w_high"] !== undefined ? `$${md["52w_high"]?.toFixed(2)}` : "—" },
    { label: "52W Low",    value: md["52w_low"] !== undefined ? `$${md["52w_low"]?.toFixed(2)}` : "—" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {metrics.map(({ label, value }) => (
        <div key={label} className="bg-ink-50/70 rounded-lg p-2.5">
          <div className="text-[9px] text-ink-400 uppercase tracking-wider font-medium mb-0.5">
            {label}
          </div>
          <div className="tabnum text-[12px] font-semibold text-ink-800">{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── News Section ──────────────────────────────────────────────────────────────
function NewsSection({ news }: { news: NewsData }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={13} className="text-ink-400" />
          <span className="text-[12px] font-semibold text-ink-700">
            News & Sentiment
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SentimentBadge sentiment={news.sentiment_summary.overall} />
          <SourcePill source={news.source} />
        </div>
      </div>

      {/* Sentiment breakdown */}
      <div className="flex items-center gap-1 h-1.5 rounded-full overflow-hidden bg-ink-100">
        {news.sentiment_summary.positive_count > 0 && (
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{
              width: `${(news.sentiment_summary.positive_count / news.articles.length) * 100}%`,
            }}
          />
        )}
        {news.sentiment_summary.neutral_count > 0 && (
          <div
            className="h-full bg-ink-300 transition-all"
            style={{
              width: `${(news.sentiment_summary.neutral_count / news.articles.length) * 100}%`,
            }}
          />
        )}
        {news.sentiment_summary.negative_count > 0 && (
          <div
            className="h-full bg-red-400 transition-all"
            style={{
              width: `${(news.sentiment_summary.negative_count / news.articles.length) * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-ink-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {news.sentiment_summary.positive_count} positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-300 inline-block" />
          {news.sentiment_summary.neutral_count} neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          {news.sentiment_summary.negative_count} negative
        </span>
      </div>

      {/* Article list */}
      <div className="space-y-1.5 mt-2">
        {news.articles.slice(0, 5).map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-ink-100 hover:bg-ink-50 transition-colors group"
          >
            <SentimentBadge sentiment={article.sentiment} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-ink-700 group-hover:text-amber-700 line-clamp-1 transition-colors">
                {article.title}
              </div>
              {article.summary && (
                <div className="text-[10px] text-ink-400 mt-0.5 line-clamp-2">
                  {article.summary}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-ink-400">{article.source}</span>
                <span className="text-[10px] text-ink-300">·</span>
                <span className="text-[10px] text-ink-400">
                  {format(parseISO(article.published_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <ExternalLink size={10} className="text-ink-300 flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Filings Section ───────────────────────────────────────────────────────────
function FilingsSection({ filings }: { filings: FilingsData }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={13} className="text-ink-400" />
          <span className="text-[12px] font-semibold text-ink-700">
            Filings & Documents
          </span>
        </div>
        <SourcePill source={filings.source} />
      </div>

      {filings.results.length === 0 ? (
        <p className="text-[12px] text-ink-400">No relevant filings found.</p>
      ) : (
        <div className="space-y-1.5">
          {filings.results.slice(0, 4).map((r) => (
            <div key={r.doc_id} className="p-2.5 rounded-lg border border-ink-100 bg-ink-50/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  {r.doc_type}
                </span>
                <span className="tabnum text-[10px] text-ink-400">
                  relevance: {(r.relevance_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-[12px] font-medium text-ink-700 mb-0.5">{r.title}</div>
              <p className="text-[11px] text-ink-500 line-clamp-2">{r.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Company card ──────────────────────────────────────────────────────────────
function CompanyCard({ company }: { company: ReportData["companies"][0] }) {
  const { ticker, company_name, market_data, news, filings } = company;
  const hasMD = market_data && !market_data.error;

  return (
    <div className="card overflow-hidden">
      {/* Company header */}
      <div className="px-5 py-4 border-b border-ink-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="tabnum text-sm font-bold text-ink-900">{ticker}</span>
              {hasMD && <ChangeBadge value={market_data.day_change_pct} />}
            </div>
            <div className="text-[13px] text-ink-600 mt-0.5">{company_name}</div>
            {market_data?.sector && (
              <div className="text-[11px] text-ink-400 mt-0.5">
                {market_data.sector} · {market_data.industry}
              </div>
            )}
          </div>
          {hasMD && (
            <div className="text-right">
              <div className="tabnum text-xl font-semibold text-ink-900">
                {market_data.current_price !== undefined
                  ? `$${market_data.current_price.toFixed(2)}`
                  : "—"}
              </div>
              <SourcePill source={market_data.source} />
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Chart */}
        {hasMD && market_data.history?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={12} className="text-ink-400" />
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                {market_data.history_period} Price History
              </span>
            </div>
            <StockChart data={market_data.history} ticker={ticker} />
          </div>
        )}

        {/* Metrics */}
        {hasMD && <MetricGrid md={market_data} />}

        {/* Error state */}
        {market_data?.error && (
          <div className="flex items-center gap-2 text-[12px] text-ink-400 bg-ink-50 rounded-lg px-3 py-2">
            <Info size={12} />
            <span>Market data unavailable: {market_data.error}</span>
          </div>
        )}

        {/* News */}
        {news && news.articles.length > 0 && (
          <>
            <div className="border-t border-ink-100 pt-4" />
            <NewsSection news={news} />
          </>
        )}

        {/* Filings */}
        {filings && filings.results.length > 0 && (
          <>
            <div className="border-t border-ink-100 pt-4" />
            <FilingsSection filings={filings} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Analysis section ──────────────────────────────────────────────────────────
function AnalysisSection({ data }: { data: ReportData }) {
  const { analysis } = data;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Key Insights */}
      {analysis.key_insights?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
              <Lightbulb size={12} className="text-amber-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-ink-800">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {analysis.key_insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-ink-600">
                <span className="tabnum text-[10px] text-amber-500 font-bold mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunities */}
      {analysis.opportunities?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
              <Target size={12} className="text-emerald-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-ink-800">Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {analysis.opportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-ink-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {analysis.risk_factors?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
              <AlertTriangle size={12} className="text-red-500" />
            </div>
            <h3 className="text-[13px] font-semibold text-ink-800">Risk Factors</h3>
          </div>
          <ul className="space-y-2">
            {analysis.risk_factors.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-ink-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitive Landscape */}
      {analysis.competitive_landscape && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
              <BarChart2 size={12} className="text-blue-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-ink-800">Competitive Landscape</h3>
          </div>
          <p className="text-[12px] text-ink-600 leading-relaxed">
            {analysis.competitive_landscape}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main ReportView export ────────────────────────────────────────────────────
export function ReportView({ data }: { data: ReportData }) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {data.executive_summary && (
        <div className="card p-5 border-l-4 border-l-amber-400 animate-slide-up">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-2">
            Executive Summary
          </div>
          <p className="text-[13px] text-ink-700 leading-relaxed">
            {data.executive_summary}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <SentimentBadge sentiment={data.analysis.overall_sentiment} />
            {data.sources?.slice(0, 3).map((src) => (
              <SourcePill key={src} source={src} />
            ))}
          </div>
        </div>
      )}

      {/* Per-company cards */}
      {data.companies?.map((company, i) => (
        <div
          key={company.ticker}
          className="animate-slide-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CompanyCard company={company} />
        </div>
      ))}

      {/* Analysis grids */}
      <div className="animate-slide-up delay-225">
        <AnalysisSection data={data} />
      </div>

      {/* Sources footer */}
      {data.sources?.length > 0 && (
        <div className="animate-slide-up delay-300 p-4 rounded-xl border border-ink-100 bg-ink-50/50">
          <div className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-2">
            Data Sources
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.sources.map((src) => (
              <SourcePill key={src} source={src} />
            ))}
          </div>
          <div className="text-[10px] text-ink-400 mt-2">
            Generated at {data.generated_at
              ? format(new Date(data.generated_at), "MMM d, yyyy h:mm a")
              : "—"}
          </div>
        </div>
      )}
    </div>
  );
}