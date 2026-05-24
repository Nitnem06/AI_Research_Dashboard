"use client"

import { useState } from "react"

import {
  BrainCircuit,
  TrendingUp,
  Activity,
  FileText,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"

import { TopNavbar } from "@/components/dashboard/top-navbar"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"

export default function DashboardPage() {
  // ===============================
  // AI SEARCH STATE (NEW - SAFE)
  // ===============================
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    try {
      setLoading(true)

      const res = await fetch("http://127.0.0.1:8000/research/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-white">

      <div className="p-6 md:p-8">
        {/* HERO */}

        <section
          className="
            glass
            relative
            overflow-hidden
            rounded-[36px]
            p-8
            md:p-12
          "
        >
          <div
            className="
              absolute
              right-0
              top-0
              h-72
              w-72
              rounded-full
              bg-violet-500/20
              blur-3xl
            "
          />

          <div className="relative z-10 max-w-3xl">
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-sm
                text-zinc-300
              "
            >
              <Sparkles className="h-4 w-4 text-violet-300" />

              AI-Powered Research Intelligence
            </div>

            <h1
              className="
                text-5xl
                font-black
                leading-tight
                tracking-tight
                md:text-7xl
              "
            >
              Institutional Grade
              <span className="gradient-text block">
                Research Dashboard
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-lg
                leading-relaxed
                text-zinc-400
              "
            >
              Monitor market signals, AI-generated insights,
              research pipelines, and portfolio intelligence
              from one unified workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                className="
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-500
                  to-fuchsia-500
                  px-6
                  py-4
                  font-semibold
                  transition-all
                  hover:scale-[1.03]
                "
              >
                Generate Report
              </button>

              <button
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-6
                  py-4
                  font-semibold
                  text-zinc-300
                  transition-all
                  hover:bg-white/10
                "
              >
                Explore Analytics
              </button>
            </div>
          </div>
        </section>

        {/* ===============================
            AI SEARCH (NEW FEATURE - SAFE ADDITION)
        =============================== */}
        <section className="mt-8 glass rounded-[32px] p-6">
          <h2 className="text-xl font-bold mb-4">
            Ask Research AI
          </h2>

          <div className="flex gap-3">
            <input
              className="flex-1 rounded-xl bg-white/5 p-3 text-white outline-none"
              placeholder="e.g. NVIDIA revenue growth"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={search}
              className="rounded-xl bg-violet-500 px-6 py-3 font-semibold"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* RESULTS */}
          <div className="mt-6 space-y-4">
            {results.map((r: any, i: number) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-sm text-violet-300">
                  {r.company} • {r.ticker}
                </div>

                <p className="mt-2 text-sm text-zinc-300">
                  {r.excerpt}
                </p>

                <div className="mt-2 text-xs text-zinc-500">
                  Score: {r.relevance_score}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* METRICS */}
        <section
          className="
            mt-8
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          <MetricCard
            title="Research Reports"
            value="148"
            change="+18% this month"
            icon={FileText}
          />

          <MetricCard
            title="AI Insights"
            value="2.4K"
            change="+31% engagement"
            icon={BrainCircuit}
          />

          <MetricCard
            title="Market Signals"
            value="89"
            change="+12 new today"
            icon={TrendingUp}
          />

          <MetricCard
            title="Active Pipelines"
            value="16"
            change="98% uptime"
            icon={Activity}
          />
        </section>

        {/* ANALYTICS GRID */}
        <section
          className="
            mt-8
            grid
            gap-6
            xl:grid-cols-3
          "
        >
          {/* LARGE PANEL */}
          <div
            className="
              glass
              col-span-2
              rounded-[32px]
              p-8
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  AI Market Overview
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Research Activity
                </h2>
              </div>

              <button
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white/5
                  px-4
                  py-2
                  text-sm
                  text-zinc-300
                "
              >
                View Full Report
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div
              className="
                mt-8
                rounded-3xl
                border
                border-white/5
                bg-black/20
                p-4
              "
            >
              <AnalyticsChart />
            </div>
          </div>

          {/* SIDE PANEL */}
          <div
            className="
              glass
              rounded-[32px]
              p-8
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  AI Summary
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Market Sentiment
                </h3>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-emerald-500/10
                  px-3
                  py-1
                  text-sm
                  text-emerald-400
                "
              >
                Bullish
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {[
                "Technology sector sentiment increased by 14%",
                "AI-related equities outperforming market average",
                "High institutional activity detected",
                "Research generation latency reduced by 28%",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-2xl
                    border
                    border-white/5
                    bg-white/[0.03]
                    p-4
                    text-sm
                    text-zinc-300
                  "
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}