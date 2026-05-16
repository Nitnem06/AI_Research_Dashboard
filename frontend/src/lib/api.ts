import type { Report, ReportSummary, WatchlistItem, DashboardStats, User, Organization } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired — clear and redirect
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (data: {
    email: string;
    name: string;
    password: string;
    org_name?: string;
    invite_code?: string;
  }) =>
    request<{ access_token: string; token_type: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }, false),

  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  me: () => request<User>("/api/auth/me"),
  org: () => request<Organization>("/api/auth/org"),
};

// ── Research ──────────────────────────────────────────────────────────────────

export const researchApi = {
  runQuery: (query: string) =>
    request<Report>("/api/research/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  listReports: (search?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return request<ReportSummary[]>(`/api/research/reports${qs ? `?${qs}` : ""}`);
  },

  getReport: (id: string) => request<Report>(`/api/research/reports/${id}`),

  updateReport: (id: string, data: { title?: string; tags?: string[] }) =>
    request<Report>(`/api/research/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteReport: (id: string) =>
    request<void>(`/api/research/reports/${id}`, { method: "DELETE" }),

  stats: () => request<DashboardStats>("/api/research/stats"),

  getWatchlist: () => request<WatchlistItem[]>("/api/research/watchlist"),

  addToWatchlist: (data: { ticker: string; company_name: string; notes?: string }) =>
    request<WatchlistItem>("/api/research/watchlist", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeFromWatchlist: (id: string) =>
    request<void>(`/api/research/watchlist/${id}`, { method: "DELETE" }),
};