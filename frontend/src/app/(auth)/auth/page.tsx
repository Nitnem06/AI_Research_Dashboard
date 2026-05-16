"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  BrainCircuit,
  ArrowRight,
} from "lucide-react"

export default function AuthPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* BACKGROUND */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top_left,rgba(190,24,93,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.14),transparent_25%)]
        "
      />

      {/* NAVBAR */}

      <header className="relative z-20">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-[#1a1625]
                border
                border-rose-500/10
              "
            >
              <BrainCircuit className="h-5 w-5 text-rose-300" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Klypup Research
            </span>
          </div>

          <Link
            href="/login"
            className="
              rounded-full
              bg-[#1a1625]
              border
              border-rose-500/10
              px-5
              py-2.5
              text-sm
              text-zinc-300
              transition
              hover:bg-[#221c30]
            "
          >
            Back
          </Link>
        </div>
      </header>

      {/* AUTH CARD */}

      <section
        className="
          relative
          z-10
          flex
          min-h-[85vh]
          items-center
          justify-center
          px-6
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            w-full
            max-w-md
            rounded-[36px]
            border
            border-rose-500/10
            bg-[#13111a]/95
            p-8
            shadow-2xl
            backdrop-blur-2xl
          "
        >
          {/* HEADER */}

          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight">
              Welcome back
            </h1>

            <p className="mt-3 text-zinc-400">
              Access your AI research workspace
            </p>
          </div>

          {/* FORM */}

          <form className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-rose-500/10
                  bg-[#1a1625]
                  px-5
                  text-white
                  outline-none
                  transition
                  focus:border-rose-400/30
                "
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-rose-500/10
                  bg-[#1a1625]
                  px-5
                  text-white
                  outline-none
                  transition
                  focus:border-rose-400/30
                "
              />
            </div>

            {/* LOGIN BUTTON */}

            <Link
              href="/dashboard"
              className="
                group
                mt-4
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-gradient-to-r
                from-rose-500
                to-orange-400
                font-semibold
                text-white
                transition-all
                hover:scale-[1.02]
              "
            >
              Continue

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </form>

          {/* FOOTER */}

          <div className="mt-8 text-center text-sm text-zinc-400">
            Don’t have an account?{" "}

            <span className="text-rose-300">
              Create one
            </span>
          </div>
        </motion.div>
      </section>
    </main>
  )
}