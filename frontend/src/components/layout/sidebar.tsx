"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, LayoutDashboard, Search, Bookmark, LogOut, Star } from "lucide-react";
import { logout } from "@/lib/auth";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/research", label: "New Research", icon: Search },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-ink-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
            <TrendingUp size={14} className="text-ink-950" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-ink-900 leading-none">Klypup</div>
            <div className="text-[10px] text-ink-400 mt-0.5">Research</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] text-ink-400 uppercase tracking-widest px-2 mb-2 font-medium">Workspace</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
              isActive(href, exact)
                ? "bg-ink-900 text-white"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}

        <div className="pt-4">
          <p className="text-[10px] text-ink-400 uppercase tracking-widest px-2 mb-2 font-medium">Reports</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-colors"
          >
            <Bookmark size={15} />
            Saved Reports
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-ink-100">
        <button
          onClick={() => logout()}
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-lg text-sm text-ink-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}