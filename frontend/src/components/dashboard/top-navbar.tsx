"use client"

import { Bell, Search } from "lucide-react"

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <input
            placeholder="Search research, projects..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/5
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              focus:border-violet-500/40
              focus:bg-white/10
            "
          />
        </div>

        <div className="ml-6 flex items-center gap-4">
          <button className="relative rounded-xl p-2 hover:bg-white/5">
            <Bell className="h-5 w-5 text-zinc-300" />

            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-violet-500" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500" />

            <div className="hidden md:block">
              <p className="text-sm font-medium">
                Nitnem
              </p>

              <p className="text-xs text-zinc-400">
                AI Developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}