"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Star,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Tag,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats, ReportSummary, WatchlistItem } from "@/components";
import { format, parseISO } from "date-fns";
import clsx from "clsx";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  delay?: number;
}) {
  return (
    <div
      className="card p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center">
          <Icon size={15} className="text-ink-500" />
        </div>
      </div>
      <div className="tabnum text-2xl font-semibold text-ink-900">{value}</div>
      <div className="text-[13px] text-ink-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-ink-400 mt-1">{sub}</div>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3.5 px-5">
      <div className="skeleton h-3.5 w-48 rounded" />
      <div className="skeleton h-3.5 w-24 rounded ml-auto" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.stats.dashboard(),
      api.research.getReports(),
      api.watchlist.get(),
    ]).then(([s, r, w]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (r.status === "fulfilled") setReports(r.value.slice(0, 6));
      if (w.status === "fulfilled") setWatchlist(w.value.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const QUICK_ACTIONS = [
    {
      href: "/dashboard/research",
      label: "New Research",
      desc: "Run an AI-powered analysis",
      icon: Search,
      color: "text-amber-600",
      bg: "bg-amber-50 hover:bg-amber-100/70",
    },
    {
      href: "/dashboard/reports",
      label: "Saved Reports",
      desc: "Browse your research history",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100/70",
    },
    {
      href: "/dashboard/watchlist",
      label: "Watchlist",
      desc: "Track your companies",
      icon: Star,
      color: "text-emerald-600",
      bg: "bg-emerald-50 hover:bg-emerald-100/70",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Overview
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Reports"
          value={loading ? "—" : (stats?.total_reports ?? 0)}
          icon={FileText}
          delay={0}
        />
        <StatCard
          label="Watchlist"
          value={loading ? "—" : (stats?.watchlist_companies ?? 0)}
          icon={Star}
          sub="companies tracked"
          delay={60}
        />
        <StatCard
          label="This Week"
          value={loading ? "—" : reports.filter((r) => {
            const d = new Date(r.created_at);
            const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 7;
          }).length}
          icon={TrendingUp}
          sub="analyses run"
          delay={120}
        />
        <StatCard
          label="Unique Tickers"
          value={loading ? "—" : new Set(reports.flatMap((r) =>
            r.tickers.split(",").map((t) => t.trim()).filter(Boolean)
          )).size}
          icon={BarChart2}
          sub="companies researched"
          delay={180}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up delay-150">
        {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, color, bg }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-4 p-4 rounded-xl border border-ink-100 transition-all duration-200 group",
              bg
            )}
          >
            <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm border border-ink-100")}>
              <Icon size={16} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">{label}</div>
              <div className="text-[11px] text-ink-500 truncate">{desc}</div>
            </div>
            <ArrowRight size={13} className="text-ink-300 group-hover:text-ink-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-5 gap-6">
        {/* Recent Reports */}
        <div className="col-span-3 card overflow-hidden animate-slide-up delay-225">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-ink-400" />
              <h2 className="text-sm font-semibold text-ink-800">Recent Reports</h2>
            </div>
            <Link
              href="/dashboard/reports"
              className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View all
              <ChevronRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div>
              {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center mb-3">
                <Search size={18} className="text-ink-300" />
              </div>
              <p className="text-sm font-medium text-ink-700">No reports yet</p>
              <p className="text-[12px] text-ink-400 mt-1">
                Run your first research query to get started.
              </p>
              <Link
                href="/dashboard/research"
                className="mt-4 px-4 py-2 bg-amber-500 text-ink-950 rounded-lg text-[12px] font-semibold hover:bg-amber-400 transition-colors"
              >
                New Research
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/reports/${report.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50/60 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-800 truncate group-hover:text-amber-700 transition-colors">
                      {report.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {report.tickers && (
                        <span className="tabnum text-[10px] font-semibold text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">
                          {report.tickers}
                        </span>
                      )}
                      {report.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-400 flex-shrink-0">
                    {format(parseISO(report.created_at), "MMM d")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Preview */}
        <div className="col-span-2 card overflow-hidden animate-slide-up delay-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-ink-400" />
              <h2 className="text-sm font-semibold text-ink-800">Watchlist</h2>
            </div>
            <Link
              href="/dashboard/watchlist"
              className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              Manage
              <ChevronRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Star size={20} className="text-ink-200 mb-2" />
              <p className="text-[12px] text-ink-400">
                Add companies to your watchlist for quick access
              </p>
              <Link
                href="/dashboard/watchlist"
                className="mt-3 text-[11px] text-amber-600 hover:underline font-medium"
              >
                Add company →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {watchlist.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="tabnum text-[13px] font-semibold text-ink-800">
                      {item.ticker}
                    </div>
                    <div className="text-[11px] text-ink-400 truncate max-w-[130px]">
                      {item.company_name}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/research?q=${encodeURIComponent(item.ticker)}`}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Analyse →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}