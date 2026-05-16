"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Activity,
  FolderKanban,
} from "lucide-react"

import { MetricCard } from "@/components/dashboard/metric-card"

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      {/* BACKGROUND ORBS */}

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* HERO */}

      <section
        className="
          relative
          z-10
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="
            glass
            mb-8
            inline-flex
            items-center
            gap-3
            rounded-full
            px-6
            py-3
          "
        >
          <Sparkles className="h-5 w-5 text-violet-300" />

          <span className="text-sm text-zinc-300">
            Intelligent AI Workspace
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.2,
          }}
          className="
            max-w-5xl
            text-6xl
            font-black
            leading-[1]
            tracking-tight
            md:text-8xl
          "
        >
          The Future of
          <br />

          <span className="gradient-text">
            AI Research
          </span>

          <br />

          Starts Here.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.5,
            duration: 1,
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
          Build intelligent workflows, manage research,
          generate insights, and orchestrate AI systems
          inside a premium next-generation workspace.
        </motion.p>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.8,
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
              gap-2
              rounded-full
              bg-gradient-to-r
              from-violet-500
              to-cyan-500
              px-8
              py-4
              text-sm
              font-semibold
              transition-all
              hover:scale-105
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
              glass
              rounded-full
              px-8
              py-4
              text-sm
              text-zinc-300
              transition-all
              hover:scale-105
            "
          >
            Watch Demo
          </button>
        </motion.div>
      </section>

      {/* FLOATING DASHBOARD PREVIEW */}

      <motion.section
        initial={{
          opacity: 0,
          y: 80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1,
          duration: 1,
        }}
        className="
          relative
          z-10
          mx-auto
          mt-24
          max-w-7xl
        "
      >
        <div
          className="
            glass
            overflow-hidden
            rounded-[40px]
            p-8
          "
        >
          {/* TOP BAR */}

          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                AI Command Center
              </h2>

              <p className="mt-2 text-zinc-400">
                Real-time intelligent analytics
              </p>
            </div>

            <div
              className="
                rounded-full
                border
                border-white/10
                bg-white/5
                px-5
                py-2
                text-sm
                text-zinc-300
              "
            >
              Live System
            </div>
          </div>

          {/* METRIC CARDS */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Research Tasks"
              value="148"
              change="+12% this week"
              icon={BrainCircuit}
            />

            <MetricCard
              title="Projects"
              value="23"
              change="+4 active"
              icon={FolderKanban}
            />

            <MetricCard
              title="AI Generations"
              value="8.2k"
              change="+18%"
              icon={Sparkles}
            />

            <MetricCard
              title="System Health"
              value="99.2%"
              change="Stable"
              icon={Activity}
            />
          </div>

          {/* BIG PANEL */}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div
              className="
                glass
                lg:col-span-2
                rounded-[30px]
                p-8
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    AI Analytics
                  </h3>

                  <p className="mt-2 text-zinc-400">
                    Intelligent system monitoring
                  </p>
                </div>

                <div
                  className="
                    rounded-full
                    bg-violet-500/10
                    px-4
                    py-2
                    text-sm
                    text-violet-300
                  "
                >
                  +18%
                </div>
              </div>

              <div
                className="
                  mt-8
                  flex
                  h-[320px]
                  items-center
                  justify-center
                  rounded-[24px]
                  border
                  border-white/5
                  bg-gradient-to-br
                  from-violet-500/10
                  to-cyan-500/10
                "
              >
                <p className="text-zinc-500">
                  Interactive analytics visualization
                </p>
              </div>
            </div>

            <div
              className="
                glass
                rounded-[30px]
                p-8
              "
            >
              <h3 className="text-2xl font-bold">
                Recent Activity
              </h3>

              <div className="mt-8 space-y-5">
                {[1,2,3,4].map((item) => (
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                    }}
                    key={item}
                    className="
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-white/5
                      bg-white/[0.03]
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-violet-500/10
                      "
                    >
                      <Sparkles className="h-5 w-5 text-violet-300" />
                    </div>

                    <div>
                      <p className="font-medium">
                        AI report generated
                      </p>

                      <p className="text-sm text-zinc-400">
                        2 mins ago
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}