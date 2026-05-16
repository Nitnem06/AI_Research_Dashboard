"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(form.email, form.password);
      saveToken(res.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col w-[420px] bg-ink-950 p-12 justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-ink-950" />
            </div>
            <span className="font-display text-xl font-semibold text-white">Klypup Research</span>
          </div>
          <h1 className="font-display text-4xl font-medium text-white leading-tight mb-4">
            AI-powered research,<br />
            <em className="not-italic text-amber-400">minutes not days.</em>
          </h1>
          <p className="text-ink-400 leading-relaxed">
            Query earnings calls, market data, and SEC filings through natural language. 
            Get structured, source-attributed analysis instantly.
          </p>
        </div>
        <div className="space-y-4">
          {["NVDA", "AAPL", "TSLA"].map((ticker) => (
            <div key={ticker} className="bg-ink-900 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-sm text-ink-300">{ticker}</span>
              <span className="text-xs text-ink-500">Live market data</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
              <TrendingUp size={14} className="text-ink-950" />
            </div>
            <span className="font-display text-lg font-semibold">Klypup Research</span>
          </div>

          <h2 className="font-display text-3xl font-medium text-ink-900 mb-1">Welcome back</h2>
          <p className="text-ink-500 mb-8 text-sm">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="analyst@firm.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            No account?{" "}
            <Link href="/signup" className="text-ink-900 font-medium hover:underline">
              Create workspace
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-8 border border-dashed border-ink-200 rounded-lg p-4">
            <p className="text-xs text-ink-500 font-medium mb-2">DEMO CREDENTIALS</p>
            <p className="text-xs text-ink-600 font-mono">admin@acme.com / password123</p>
            <p className="text-xs text-ink-400 mt-1">
              (create via signup first, then log in)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}