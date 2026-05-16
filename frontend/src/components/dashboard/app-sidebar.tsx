"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BrainCircuit,
  FolderKanban,
  Settings,
  ChevronLeft,
} from "lucide-react"

import clsx from "clsx"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Research",
    icon: BrainCircuit,
    href: "/dashboard/research",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/dashboard/projects",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-72 flex-col border-r border-white/10 bg-zinc-900/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            AI Research
          </h1>

          <p className="text-xs text-zinc-400">
            Dashboard Workspace
          </p>
        </div>

        <button className="rounded-lg p-2 hover:bg-white/5 transition">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon

          return (
            <Link
              key={route.href}
              href={route.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
                pathname === route.href
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />

              {route.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 p-4">
          <p className="text-sm font-medium">
            Pro AI Insights
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Unlock deeper analytics and research tools.
          </p>
        </div>
      </div>
    </aside>
  )
}