"use client"

import {
  Bell,
  Search,
  Sparkles,
} from "lucide-react"

export function TopNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-white/5
        bg-black/30
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex
          h-20
          items-center
          justify-between
          px-6
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-500
              to-fuchsia-500
              shadow-lg
              shadow-violet-500/30
            "
          >
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              AI Research Hub
            </h1>

            <p className="text-xs text-zinc-500">
              Institutional Analytics Workspace
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="hidden lg:block relative w-full max-w-xl">
          <Search
            className="
              absolute
              left-4
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            placeholder="Search reports, AI insights, market signals..."
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/5
              pl-12
              pr-4
              text-sm
              outline-none
              transition-all
              focus:border-violet-500/40
              focus:bg-white/10
            "
          />
        </div>

        {/* RIGHT */}

        <div className="ml-6 flex items-center gap-4">
          <button
            className="
              relative
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-3
              transition
              hover:bg-white/10
            "
          >
            <Bell className="h-5 w-5 text-zinc-300" />

            <span
              className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
                bg-violet-500
              "
            />
          </button>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-full
                bg-gradient-to-br
                from-violet-500
                to-indigo-500
              "
            />

            <div className="hidden md:block">
              <p className="text-sm font-medium">
                Nitnem
              </p>

              <p className="text-xs text-zinc-400">
                AI Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}