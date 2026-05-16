"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Building2, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api";
import { saveToken } from "@/lib/auth";

type Mode = "create" | "join";

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("create");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    org_name: "", invite_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload =
        mode === "create"
          ? { name: form.name, email: form.email, password: form.password, org_name: form.org_name }
          : { name: form.name, email: form.email, password: form.password, invite_code: form.invite_code };

      const res = await authApi.signup(payload);
      saveToken(res.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-ink-950" />
          </div>
          <span className="font-display text-xl font-semibold">Klypup Research</span>
        </div>

        <h1 className="font-display text-3xl font-medium text-ink-900 mb-1">Get started</h1>
        <p className="text-ink-500 mb-7 text-sm">Create a workspace or join an existing one</p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-ink-100 rounded-lg">
          {(["create", "join"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                mode === m
                  ? "bg-white text-ink-900 shadow-card"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {m === "create" ? <Building2 size={14} /> : <KeyRound size={14} />}
              {m === "create" ? "New Workspace" : "Join Workspace"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Jane Smith" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Work Email</label>
            <input className="input" type="email" placeholder="jane@firm.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="8+ characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>

          {mode === "create" ? (
            <div>
              <label className="label">Organization Name</label>
              <input className="input" placeholder="Acme Capital" value={form.org_name}
                onChange={(e) => setForm({ ...form, org_name: e.target.value })} required />
              <p className="text-xs text-ink-400 mt-1">You'll be the admin. Share your invite code with teammates.</p>
            </div>
          ) : (
            <div>
              <label className="label">Invite Code</label>
              <input className="input font-mono" placeholder="e.g. xK3mQ8wZ" value={form.invite_code}
                onChange={(e) => setForm({ ...form, invite_code: e.target.value })} required />
              <p className="text-xs text-ink-400 mt-1">Get this from your workspace admin.</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : mode === "create" ? "Create Workspace" : "Join Workspace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="text-ink-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}