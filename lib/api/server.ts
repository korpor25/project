// Server-side authenticated fetcher.
//
// Server components can't use the browser `apiFetch` (no window, no localStorage).
// This helper reads the Supabase session from the request cookies and attaches
// the access token, so authenticated routes work in SSR/RSC.

import { createClient } from "@/lib/supabase/server";
import { ApiError, type ApiErrorPayload } from "./error";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type ServerFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Number of seconds to cache the response. Pass 0 to disable caching. */
  revalidate?: number;
};

export async function serverFetch<T>(
  path: string,
  opts: ServerFetchOptions = {},
): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    next:
      opts.revalidate === undefined
        ? { revalidate: 0 }
        : { revalidate: opts.revalidate },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const payload = (data as { error?: ApiErrorPayload } | null)?.error ?? {
      code: "UNKNOWN_ERROR",
      message: res.statusText || "เกิดข้อผิดพลาด",
    };
    throw new ApiError(res.status, payload);
  }

  // Some endpoints return data with optional meta; we return the full envelope
  // so callers can pick what they need (e.g. pagination).
  return data as T;
}
