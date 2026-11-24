import { createClient } from "@/lib/supabase/client";
import { ApiError, type ApiErrorPayload } from "./error";

// Client-side calls use a relative base so they go through Next.js rewrites
// (next.config.ts → /api/* → backend). This avoids CORS when the backend is
// on a different origin (e.g. Render) while the frontend runs locally.
const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080");

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true, omit the Authorization header (use for truly public endpoints). */
  anonymous?: boolean;
};

async function authHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  // BASE_URL is "" on the browser so requests go through the Next.js proxy.
  // `new URL("/api/...")` without a base throws — supply window.location.origin
  // so relative paths resolve to the current page's origin.
  const absolute = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const base = typeof window !== "undefined" ? window.location.origin : undefined;
  const url = new URL(absolute, base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.anonymous ? {} : await authHeader()),
    ...opts.headers,
  };

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch {
    throw new ApiError(503, { code: "SERVICE_UNAVAILABLE", message: "ไม่สามารถเชื่อมต่อ API ได้" });
  }

  const text = await res.text();
  // Only parse when the server actually returned JSON. Some endpoints reply
  // with `204 No Content` (empty body) or — for misconfigured handlers — a
  // bare status-text body like "Created". Treat those as `null` so callers
  // see the right shape instead of a JSON.parse SyntaxError.
  const ct = res.headers.get("content-type") ?? "";
  const looksJSON = ct.includes("application/json") && text.length > 0;
  let data: unknown = null;
  if (looksJSON) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const payload = (data as { error?: ApiErrorPayload } | null)?.error ?? {
      code: "UNKNOWN_ERROR",
      message: res.statusText || text || "เกิดข้อผิดพลาด",
    };
    throw new ApiError(res.status, payload);
  }

  // 2xx with no JSON body — common for 204 or void mutations.
  if (data == null) {
    return undefined as T;
  }
  return (data as { data: T }).data;
}
