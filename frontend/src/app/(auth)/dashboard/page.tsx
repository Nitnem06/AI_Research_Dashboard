"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, FileText, Star, ArrowRight, Clock, Tag, Trash2 } from "lucide-react";
import { researchApi, authApi } from "@/lib/api";
import type { ReportSummary, DashboardStats, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

const EXAMPLE_QUERIES = [
  "Analyze NVIDIA's Q3 earnings and compare with AMD",
  "Give me a quick overview of Tesla — stock and recent news",
  "Compare Microsoft and Apple balance sheets",
  "NVIDIA competitive threats and GPU market sentiment",
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, s, r] = await Promise.all([
          authApi.me(),
          researchApi.stats(),
          researchApi.listReports(),
        ]);
        setUser(u);
        setStats(s);
        setReports(r);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteReport(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this report?")) return;
    await researchApi.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (stats) setStats({ ...stats, total_reports: stats.total_reports - 1 });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-ink-300 border-t-ink-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-medium text-ink-900">
          Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-ink-500 text-sm mt-1">Your investment research workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Research Reports", value: stats?.total_reports ?? 0, icon: FileText },
          { label: "Watchlist", value: stats?.watchlist_companies ?? 0, icon: Star },
          { label: "Today", value: reports.filter((r) =>
              new Date(r.created_at).toDateString() === new Date().toDateString()
            ).length, icon: Clock },
          { label: "AI Engine", value: "Live", icon: TrendingUp, text: true },
        ].map(({ label, value, icon: Icon, text }) => (
          <div key={label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">{label}</span>
              <Icon size={15} className="text-ink-300" />
            </div>
            {text ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="font-mono text-sm font-medium text-emerald-600">{value}</span>
              </div>
            ) : (
              <div className="metric-value">{value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick research + examples */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">Start Researching</h2>
          <Link href="/dashboard/research" className="btn-primary">
            <Search size={14} />
            New Research
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/dashboard/research?q=${encodeURIComponent(q)}`}
              className="group flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:border-ink-300 hover:bg-ink-50 transition-all"
            >
              <span className="text-sm text-ink-600 group-hover:text-ink-900 line-clamp-1">{q}</span>
              <ArrowRight size={14} className="text-ink-300 group-hover:text-ink-600 flex-shrink-0 ml-2 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">Recent Reports</h2>
          <span className="text-sm text-ink-400">{reports.length} total</span>
        </div>

        {reports.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={32} className="text-ink-200 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">No reports yet.</p>
            <p className="text-ink-400 text-xs mt-1">Run your first research query above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/research/${report.id}`}
                className="group card px-5 py-4 flex items-start justify-between hover:shadow-card-hover transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ink-900 truncate">{report.title}</span>
                    {report.tickers && (
                      <span className="flex-shrink-0 font-mono text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                        {report.tickers.split(",")[0]}
                        {report.tickers.split(",").length > 1 && ` +${report.tickers.split(",").length - 1}`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-400 truncate">{report.query}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </span>
                    {report.tags.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <Tag size={11} />
                        {report.tags.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteReport(report.id, e)}
                  className="opacity-0 group-hover:opacity-100 ml-4 p-1.5 rounded text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}