"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Activity,
} from "lucide-react"

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_30%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      {/* NAVBAR */}

      <header className="relative z-20">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-2xl
                bg-white/5
                backdrop-blur-xl
              "
            >
              <BrainCircuit className="h-5 w-5 text-rose-300" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Klypup Research
            </span>
          </div>

<Link
  href="/auth"
  className="
    rounded-full
    border
    border-white/10
    bg-white/5
    px-5
    py-2.5
    text-sm
    text-zinc-200
    backdrop-blur-xl
    transition-all
    hover:scale-105
    hover:bg-white/10
  "
>
  Sign In
</Link>
        </div>
      </header>

      {/* HERO */}

      <section
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[85vh]
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-6
          text-center
        "
      >
        {/* BADGE */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            mb-8
            inline-flex
            items-center
            gap-3
            rounded-full
            border
            border-white/10
            bg-white/5
            px-5
            py-3
            backdrop-blur-xl
          "
        >
          <Sparkles className="h-4 w-4 text-rose-300" />

          <span className="text-sm text-zinc-300">
            AI-powered research workspace
          </span>
        </motion.div>

        {/* HEADING */}

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.2,
          }}
          className="
            max-w-5xl
            text-6xl
            font-black
            leading-[0.92]
            tracking-[-0.04em]
            md:text-8xl
          "
        >
          AI research,
          <br />

          <span
            className="
              bg-gradient-to-r
              from-white
              via-rose-200
              to-orange-200
              bg-clip-text
              text-transparent
            "
          >
            reimagined
          </span>

          <br />

          for modern teams.
        </motion.h1>

        {/* SUBTEXT */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            delay: 0.5,
          }}
          className="
            mt-8
            max-w-2xl
            text-lg
            leading-relaxed
            text-zinc-400
            md:text-xl
          "
        >
          Query financial data, generate structured AI
          insights, automate workflows, and orchestrate
          research pipelines inside one intelligent platform.
        </motion.p>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.8,
          }}
          className="
            mt-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-4
          "
        >
          <button
            className="
              group
              flex
              items-center
              gap-3
              rounded-full
              bg-white
              px-7
              py-4
              text-sm
              font-semibold
              text-black
              transition-all
              hover:scale-[1.03]
            "
          >
            Launch Workspace

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>

          <button
            className="
              rounded-full
              border
              border-white/10
              bg-white/5
              px-7
              py-4
              text-sm
              text-zinc-300
              backdrop-blur-xl
              transition
              hover:bg-white/10
            "
          >
            Watch Demo
          </button>
        </motion.div>

        {/* FLOATING PRODUCT MOCKUP */}

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            delay: 1,
          }}
          className="
            relative
            mt-24
            w-full
            max-w-6xl
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-[40px]
              bg-gradient-to-r
              from-rose-500/20
              to-orange-400/20
              blur-3xl
            "
          />

          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-white/10
              bg-[#0b1020]/80
              shadow-2xl
              backdrop-blur-2xl
            "
          >
            {/* TOP BAR */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/10
                px-8
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div
                className="
                  rounded-full
                  bg-emerald-500/10
                  px-4
                  py-2
                  text-sm
                  text-emerald-300
                "
              >
                Live AI System
              </div>
            </div>

            {/* DASHBOARD */}

            <div className="grid gap-6 p-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div
                  className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-6
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400">
                        AI Analytics
                      </p>

                      <h3 className="mt-3 text-5xl font-black">
                        8.2k
                      </h3>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        bg-rose-500/10
                        p-4
                      "
                    >
                      <Activity className="h-7 w-7 text-rose-300" />
                    </div>
                  </div>

                  <div
                    className="
                      mt-8
                      h-48
                      rounded-2xl
                      bg-gradient-to-br
                      from-rose-500/10
                      to-orange-400/10
                    "
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    "Realtime market intelligence",
                    "Structured AI insights",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        rounded-3xl
                        border
                        border-white/10
                        bg-[#13111a]/90
                        p-6
                      "
                    >
                      <ShieldCheck className="h-8 w-8 text-orange-300" />

                      <p className="mt-4 text-lg font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="
                  rounded-3xl
                  border
                  border-rose-500/10
                  bg-[#1a1625]/90
                  p-6
                "
              >
                <h3 className="text-xl font-semibold">
                  Recent Queries
                </h3>

                <div className="mt-6 space-y-4">
                  {[
                    "NVDA earnings analysis",
                    "AAPL market forecast",
                    "TSLA quarterly trends",
                    "AI risk assessment",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        rounded-2xl
                        bg-white/[0.04]
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
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}