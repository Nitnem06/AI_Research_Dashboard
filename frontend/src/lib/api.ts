// ── Central API client ────────────────────────────────────────────────────────
// All backend calls go through here. No scattered fetch() across components.

import type {
  User,
  Report,
  ReportData,
  ReportSummary,
  WatchlistItem,
  DashboardStats,
} from "@/components/layout/index";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://ai-research-dashboard-8of2.onrender.com/";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new ApiError(res.status, body.detail ?? `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError(408, "Request timed out. The AI analysis may take up to 60 seconds.");
    }
    throw new ApiError(0, "Network error — is the backend running?");
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; token_type: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: email, password }),
      }),

    register: (data: {
      email: string;
      password: string;
      name: string;
      org_name?: string;
      invite_code?: string;
    }) =>
      request<{ access_token: string; token_type: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () => request<User>("/auth/me"),
  },

  // ── Research ───────────────────────────────────────────────────────────────
  research: {
    /** Submit a natural-language query. Returns the full AI analysis. */
    query: (query: string) =>
      request<ReportData>("/research/query", {
        method: "POST",
        body: JSON.stringify({ query }),
      }),

    /** Persist a completed analysis as a saved report. */
    saveReport: (data: {
      query: string;
      title: string;
      report_data: ReportData;
      tags: string[];
      tickers: string;
    }) =>
      request<Report>("/research/reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getReports: (search?: string) =>
      request<ReportSummary[]>(
        `/research/reports${search ? `?search=${encodeURIComponent(search)}` : ""}`
      ),

    getReport: (id: string) => request<Report>(`/research/reports/${id}`),

    deleteReport: (id: string) =>
      request<void>(`/research/reports/${id}`, { method: "DELETE" }),

    updateTags: (id: string, tags: string[]) =>
      request<Report>(`/research/reports/${id}/tags`, {
        method: "PATCH",
        body: JSON.stringify({ tags }),
      }),
  },

  // ── Watchlist ──────────────────────────────────────────────────────────────
  watchlist: {
    get: () => request<WatchlistItem[]>("/research/watchlist"),

    add: (ticker: string) =>
      request<WatchlistItem>("/research/watchlist", {
        method: "POST",
        body: JSON.stringify({ ticker }),
      }),

    remove: (id: string) =>
      request<void>(`/research/watchlist/${id}`, { method: "DELETE" }),
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    dashboard: () => request<DashboardStats>("/research/stats"),
  },
};

export { ApiError };