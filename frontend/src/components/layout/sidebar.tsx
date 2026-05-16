"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  LayoutDashboard,
  Search,
  Bookmark,
  LogOut,
  Star,
  Building2,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import type { User } from "@/components";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard",           label: "Overview",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/research",  label: "New Research", icon: Search },
  { href: "/dashboard/watchlist", label: "Watchlist",    icon: Star },
  { href: "/dashboard/reports",   label: "Saved Reports",icon: Bookmark },   // ← bug fix: was /dashboard
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "—";

  return (
    <aside className="w-[220px] flex-shrink-0 bg-ink-950 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center shadow-sm">
            <TrendingUp size={13} className="text-ink-950" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-white leading-none">
              Klypup
            </div>
            <div className="text-[10px] text-white/40 mt-0.5 tracking-wide">
              Research
            </div>
          </div>
        </div>
      </div>

      {/* Org pill */}
      {user && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.05]">
            <Building2 size={11} className="text-white/40 flex-shrink-0" />
            <span className="text-[11px] text-white/50 truncate font-medium">
              {user.role === "admin" ? "Admin" : "Analyst"}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] text-white/25 uppercase tracking-widest px-2 mb-2 font-semibold">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group",
                active
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"
              )}
            >
              <Icon size={14} className={active ? "text-amber-400" : "text-white/40 group-hover:text-white/70"} />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight size={10} className="text-amber-400/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-amber-400">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-white/80 font-medium truncate leading-none">
                {user.name}
              </div>
              <div className="text-[10px] text-white/35 truncate mt-0.5">
                {user.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-lg text-[13px] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}