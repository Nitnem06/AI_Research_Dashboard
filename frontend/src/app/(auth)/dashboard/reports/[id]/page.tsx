"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Tag, Loader2, AlertCircle, Pencil, Check, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Report } from "@/components/layout/index";
import { ReportView } from "@/components/research/ReportView";
import { format, parseISO } from "date-fns";
import clsx from "clsx";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tag editing
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    api.research.getReport(id).then((data) => {
      setReport(data);
      setTags(data.tags ?? []);
      setLoading(false);
    }).catch((err) => {
      setError(err instanceof ApiError ? err.message : "Failed to load report.");
      setLoading(false);
    });
  }, [id]);

  async function saveTags() {
    if (!report) return;
    setSavingTags(true);
    try {
      const updated = await api.research.updateTags(report.id, tags);
      setReport(updated);
      setTags(updated.tags);
    } catch {}
    setSavingTags(false);
    setEditingTags(false);
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton h-4 w-80 rounded" />
        <div className="card p-5 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-4 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="card p-8 flex flex-col items-center text-center">
          <AlertCircle size={24} className="text-red-400 mb-3" />
          <p className="text-sm font-medium text-ink-700">{error ?? "Report not found"}</p>
          <Link
            href="/dashboard/reports"
            className="mt-4 text-[12px] text-amber-600 hover:underline"
          >
            ← Back to reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/dashboard/reports"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 hover:text-ink-700 transition-colors animate-fade-in"
      >
        <ChevronLeft size={13} />
        Saved Reports
      </Link>

      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl font-semibold text-ink-900 leading-tight">
          {report.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {report.tickers && (
            <span className="tabnum text-[11px] font-bold text-ink-500 bg-ink-100 px-2 py-0.5 rounded">
              {report.tickers}
            </span>
          )}
          <span className="text-[11px] text-ink-400">
            {format(parseISO(report.created_at), "MMMM d, yyyy · h:mm a")}
          </span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {!editingTags ? (
            <>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-100"
                >
                  <Tag size={8} /> {tag}
                </span>
              ))}
              <button
                onClick={() => setEditingTags(true)}
                className="flex items-center gap-1 text-[10px] text-ink-400 hover:text-ink-600 transition-colors"
              >
                <Pencil size={9} />
                Edit tags
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-100"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X size={8} className="hover:text-red-500" />
                  </button>
                </span>
              ))}
              <input
                autoFocus
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tag…"
                className="text-[11px] border border-ink-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={saveTags}
                disabled={savingTags}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                {savingTags ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                Save
              </button>
              <button
                onClick={() => { setEditingTags(false); setTags(report.tags); }}
                className="text-[10px] text-ink-400 hover:text-ink-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Original query */}
        <div className="mt-3 p-3 rounded-lg bg-ink-50 border border-ink-100">
          <span className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider">Query</span>
          <p className="text-[12px] text-ink-600 mt-0.5 italic">&ldquo;{report.query}&rdquo;</p>
        </div>
      </div>

      {/* Report content */}
      <ReportView data={report.report_data} />
    </div>
  );
}