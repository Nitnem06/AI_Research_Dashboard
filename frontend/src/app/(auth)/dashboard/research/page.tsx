"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  BarChart2,
  Newspaper,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ArrowRight,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ReportData } from "@/components/layout/index";
import { ReportView } from "@/components/research/ReportView";
import clsx from "clsx";

// ── Tool step definitions ─────────────────────────────────────────────────────
const TOOL_STEPS = [
  {
    id: "parse",
    icon: Sparkles,
    label: "Parsing your query",
    sub: "Identifying companies, intents, and required data",
    duration: 1200,
  },
  {
    id: "market",
    icon: BarChart2,
    label: "Fetching market data",
    sub: "Prices, P/E, market cap, EPS, revenue, 30-day history",
    duration: 2000,
  },
  {
    id: "news",
    icon: Newspaper,
    label: "Searching news & sentiment",
    sub: "Scanning financial news from the past 30 days",
    duration: 2500,
  },
  {
    id: "filings",
    icon: BookOpen,
    label: "Querying knowledge base",
    sub: "SEC filings, earnings transcripts, analyst reports",
    duration: 2000,
  },
  {
    id: "synthesize",
    icon: Sparkles,
    label: "Synthesising analysis",
    sub: "Generating structured insights with source attribution",
    duration: 2000,
  },
];

const EXAMPLE_QUERIES = [
  "Analyse NVIDIA's recent earnings and compare with AMD and Intel",
  "Give me an overview of Tesla — stock performance, news, and key risks",
  "Compare the balance sheets of JPMorgan, Goldman Sachs, and Morgan Stanley",
  "What are the competitive threats facing Apple right now?",
];

// ── Tool Orchestration Visualiser ─────────────────────────────────────────────
function ToolOrchestration({ active }: { active: boolean }) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setCompletedSteps(new Set());
      setCurrentStep(0);
      return;
    }

    let stepIndex = 0;
    let totalDelay = 0;

    TOOL_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
      }, totalDelay);

      totalDelay += step.duration;

      setTimeout(() => {
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(step.id)));
      }, totalDelay - 300);
    });
  }, [active]);

  if (!active) return null;

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-ink-800">
          AI Agent — Orchestrating tools
        </span>
      </div>

      <div className="space-y-3">
        {TOOL_STEPS.map((step, i) => {
          const done = completedSteps.has(step.id);
          const running = currentStep === i && !done;
          const pending = i > currentStep;

          return (
            <div
              key={step.id}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 animate-tool-reveal",
                done   && "border-emerald-100 bg-emerald-50/50",
                running && "border-amber-200 bg-amber-50/60",
                pending && "border-ink-100 bg-ink-50/30 opacity-50"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : running ? (
                  <Loader2 size={15} className="text-amber-500 animate-spin" />
                ) : (
                  <step.icon size={15} className="text-ink-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={clsx(
                    "text-[13px] font-medium",
                    done    && "text-emerald-700",
                    running && "text-amber-700",
                    pending && "text-ink-400"
                  )}
                >
                  {step.label}
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5">{step.sub}</div>
              </div>

              {/* Tool badge */}
              <div
                className={clsx(
                  "text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0",
                  done    && "bg-emerald-100 text-emerald-600",
                  running && "bg-amber-100 text-amber-600",
                  pending && "bg-ink-100 text-ink-400"
                )}
              >
                {done ? "Done" : running ? "Running" : "Queued"}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-ink-400 mt-4 text-center">
        The AI agent decides which tools to call based on your query — not a hardcoded sequence.
      </p>
    </div>
  );
}

// ── Query Input ───────────────────────────────────────────────────────────────
function QueryInput({
  onSubmit,
  loading,
}: {
  onSubmit: (q: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim() && !loading) onSubmit(query.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card overflow-hidden focus-within:ring-2 focus-within:ring-amber-400/40 transition-shadow">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to research…
e.g. 'Analyse NVIDIA's Q3 earnings and compare with AMD. Summarise competitive threats and news sentiment.'"
          rows={4}
          className="w-full resize-none p-5 text-[14px] text-ink-900 placeholder-ink-400 focus:outline-none bg-white"
          disabled={loading}
        />
        <div className="flex items-center justify-between px-5 py-3 bg-ink-50/50 border-t border-ink-100">
          <span className="text-[11px] text-ink-400">
            <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-[10px]">⌘</kbd>
            {" + "}
            <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-[10px]">Enter</kbd>
            {" to submit"}
          </span>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150",
              query.trim() && !loading
                ? "bg-amber-500 text-ink-950 hover:bg-amber-400 shadow-sm"
                : "bg-ink-100 text-ink-400 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Search size={13} />
                Run Analysis
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example queries */}
      {!loading && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          <span className="text-[11px] text-ink-400 py-1 self-center">Try:</span>
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => {
                setQuery(eq);
                textareaRef.current?.focus();
              }}
              className="text-[11px] px-2.5 py-1 rounded-full border border-ink-200 text-ink-600 hover:bg-ink-100 hover:border-ink-300 transition-colors truncate max-w-[280px]"
            >
              {eq}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  async function runQuery(query: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedId(null);
    setLastQuery(query);

    try {
      const data = await api.research.query(query);
      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function saveReport() {
    if (!result || !lastQuery) return;
    setSaving(true);
    try {
      const tickers = result.companies
        .map((c) => c.ticker)
        .join(", ");
      const saved = await api.research.saveReport({
        query: lastQuery,
        title: result.title,
        report_data: result,
        tags: [],
        tickers,
      });
      setSavedId(saved.id);
    } catch {
      // non-fatal
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          New Research
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Ask anything about public companies — the AI agent will orchestrate the right tools.
        </p>
      </div>

      {/* Query input */}
      <div className="animate-slide-up delay-75">
        <Suspense>
          <QueryInput onSubmit={runQuery} loading={loading} />
        </Suspense>
      </div>

      {/* Tool orchestration visualiser */}
      <ToolOrchestration active={loading} />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 animate-fade-in">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Analysis failed</p>
            <p className="text-[12px] text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div ref={resultsRef} className="animate-slide-up space-y-4">
          {/* Results header with save */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink-900">
                {result.title}
              </h2>
              <p className="text-[12px] text-ink-400 mt-0.5">
                Tools used:{" "}
                <span className="text-ink-600">
                  {result.tools_used?.join(" · ") ?? "—"}
                </span>
              </p>
            </div>

            {savedId ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-[13px] font-medium">
                <CheckCircle2 size={14} />
                Saved
              </div>
            ) : (
              <button
                onClick={saveReport}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-white rounded-lg text-[13px] font-medium hover:bg-ink-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                Save Report
              </button>
            )}
          </div>

          <ReportView data={result} />
        </div>
      )}
    </div>
  );
}