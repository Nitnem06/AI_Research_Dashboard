"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Tag,
  Trash2,
  ChevronRight,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ReportSummary } from "@/components/layout/index";
import { format, parseISO } from "date-fns";
import clsx from "clsx";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filtered, setFiltered] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Collect all tags
  const allTags = Array.from(
    new Set(reports.flatMap((r) => r.tags))
  ).sort();

  useEffect(() => {
    api.research.getReports().then((data) => {
      setReports(data);
      setFiltered(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Filter whenever search / tag changes
  useEffect(() => {
    let result = reports;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.query.toLowerCase().includes(q) ||
          r.tickers.toLowerCase().includes(q)
      );
    }
    if (activeTag) {
      result = result.filter((r) => r.tags.includes(activeTag));
    }
    setFiltered(result);
  }, [search, activeTag, reports]);

  async function deleteReport(id: string) {
    setDeleting(id);
    try {
      await api.research.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // non-fatal
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Saved Reports
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {reports.length} {reports.length === 1 ? "report" : "reports"} saved
          </p>
        </div>
        <Link
          href="/dashboard/research"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-ink-950 rounded-lg text-[13px] font-semibold hover:bg-amber-400 transition-colors shadow-sm"
        >
          <Plus size={13} />
          New Research
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 animate-slide-up delay-75">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by title, query, or ticker…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-ink-200 rounded-lg text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={12} className="text-ink-400" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={clsx(
                  "text-[11px] px-2.5 py-1 rounded-full font-medium transition-all border",
                  activeTag === tag
                    ? "bg-amber-500 text-ink-950 border-amber-500"
                    : "bg-white text-ink-600 border-ink-200 hover:border-ink-300"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="card divide-y divide-ink-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="skeleton h-4 w-64 rounded" />
              <div className="skeleton h-3 w-24 rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mb-3">
            <FileText size={20} className="text-ink-300" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            {search || activeTag ? "No matching reports" : "No saved reports yet"}
          </p>
          <p className="text-[12px] text-ink-400 mt-1 max-w-xs">
            {search || activeTag
              ? "Try adjusting your search or filters."
              : "Run a research query and save the results."}
          </p>
          {!search && !activeTag && (
            <Link
              href="/dashboard/research"
              className="mt-4 px-4 py-2 bg-amber-500 text-ink-950 rounded-lg text-[12px] font-semibold hover:bg-amber-400 transition-colors"
            >
              Start Researching
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden animate-slide-up delay-150">
          <div className="divide-y divide-ink-50">
            {filtered.map((report, i) => (
              <div
                key={report.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50/60 group transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors">
                  <FileText size={14} className="text-ink-400 group-hover:text-amber-600 transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="text-[13px] font-medium text-ink-800 hover:text-amber-700 transition-colors line-clamp-1"
                  >
                    {report.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {report.tickers && (
                      <span className="tabnum text-[10px] font-semibold text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">
                        {report.tickers}
                      </span>
                    )}
                    {report.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium"
                      >
                        <Tag size={8} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="text-[11px] text-ink-400 flex-shrink-0">
                  {format(parseISO(report.created_at), "MMM d, yyyy")}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="p-1.5 rounded-md hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </Link>
                  <button
                    onClick={() => deleteReport(report.id)}
                    disabled={deleting === report.id}
                    className="p-1.5 rounded-md hover:bg-red-50 text-ink-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleting === report.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}