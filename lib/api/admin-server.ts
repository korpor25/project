import "server-only";

import { serverFetch } from "./server";
import type {
  AdminBranch,
  AdminDashboard,
  AdminUserRow,
  AppSettings,
  AuditEntry,
} from "./admin";
import type { ApiBooking } from "./bookings";

type Envelope<T> = { data: T };
type Paged<T> = {
  data: T[];
  meta?: { page: number; perPage: number; total: number };
};

export async function fetchDashboard(): Promise<AdminDashboard> {
  const res = await serverFetch<Envelope<AdminDashboard>>(
    "/api/v1/admin/dashboard",
  );
  return res.data;
}

export async function fetchBranches(): Promise<AdminBranch[]> {
  const res = await serverFetch<Envelope<AdminBranch[]>>(
    "/api/v1/admin/branches",
  );
  return res.data;
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const res = await serverFetch<Paged<AdminUserRow>>("/api/v1/admin/users", {
    query: { perPage: 100 },
  });
  return res.data;
}

export async function fetchAdminUser(id: string): Promise<AdminUserRow | null> {
  try {
    const res = await serverFetch<Envelope<AdminUserRow>>(
      `/api/v1/admin/users/${encodeURIComponent(id)}`,
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchUserBookings(id: string): Promise<ApiBooking[]> {
  try {
    const res = await serverFetch<{ data: ApiBooking[] }>(
      `/api/v1/admin/users/${encodeURIComponent(id)}/bookings`,
    );
    return res.data;
  } catch {
    return [];
  }
}

export type RevenuePoint = { label: string; revenue: number; bookings: number };

export type ZoneBreakdownRow = {
  zone: string;
  totalBooths: number;
  occupied: number;
  revenue: number;
  bookings: number;
  occupancyPct: number;
};

export async function fetchRevenueTrend(
  period: "week" | "month" | "quarter" | "year" = "month",
): Promise<RevenuePoint[]> {
  try {
    const res = await serverFetch<{ data: RevenuePoint[] }>(
      "/api/v1/admin/analytics/revenue",
      { query: { period } },
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function fetchZoneBreakdown(): Promise<ZoneBreakdownRow[]> {
  try {
    const res = await serverFetch<{ data: ZoneBreakdownRow[] }>(
      "/api/v1/admin/analytics/zones",
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await serverFetch<Envelope<AppSettings>>(
    "/api/v1/admin/settings",
  );
  return res.data;
}

export async function fetchAuditLog(
  params: { entityType?: string; action?: string; page?: number; perPage?: number } = {},
): Promise<{ rows: AuditEntry[]; total: number }> {
  const res = await serverFetch<Paged<AuditEntry>>("/api/v1/admin/audit", {
    query: {
      entityType: params.entityType,
      action: params.action,
      page: params.page ?? 1,
      perPage: params.perPage ?? 100,
    },
  });
  return { rows: res.data, total: res.meta?.total ?? res.data.length };
}
