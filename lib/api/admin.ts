// Admin types + client-side mutations.
//
// Server-side fetchers live in `admin-server.ts` so this module stays safe to
// import from client components (mutations are called from buttons/dialogs).

import type { BoothStatus } from "@/types/domain";
import { apiFetch } from "./client";

export type AdminDashboard = {
  monthRevenue: number;
  newBookings: number;
  pending: number;
  approved: number;
  totalUsers: number;
  totalBooths: number;
  available: number;
  occupancyPct: number;
};

export type AdminBranch = {
  id: string;
  name: string;
  address?: string;
  province?: string;
  floorCount: number;
  status: string;
  createdAt: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  companyName?: string;
  role: string;
  status: string;
  suspendedReason?: string;
  lastLoginAt?: string;
  createdAt: string;
};

export type AppSettings = {
  companyName: string;
  taxId?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  primaryColor: string;
  heroColor: string;
  domain?: string;
  seoTitle?: string;
  seoDescription?: string;
  serviceFeePct: number;
  depositPct: number;
  vatPct: number;
  updatedAt?: string;
};

export function updateSettings(payload: AppSettings) {
  return apiFetch<AppSettings>("/api/v1/admin/settings", {
    method: "PUT",
    body: payload,
  });
}

export type AuditEntry = {
  id: string;
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown>;
  createdAt: string;
};

// --- Analytics ---

export type ZoneBreakdownRow = {
  zone: string;
  totalBooths: number;
  occupied: number;
  revenue: number;
  bookings: number;
  occupancyPct: number;
};

export function listZoneBreakdown(branchId?: string) {
  return apiFetch<ZoneBreakdownRow[]>("/api/v1/admin/analytics/zones", {
    query: branchId ? { branchId } : undefined,
  });
}

// --- Branches ---

export function listBranches() {
  return apiFetch<AdminBranch[]>("/api/v1/admin/branches");
}

export type BranchPayload = {
  name: string;
  address?: string;
  province?: string;
  floorCount: number;
  status?: "ACTIVE" | "INACTIVE";
};

export function createBranch(payload: BranchPayload) {
  return apiFetch<AdminBranch>("/api/v1/admin/branches", {
    method: "POST",
    body: payload,
  });
}

export function updateBranch(id: string, payload: BranchPayload) {
  return apiFetch<AdminBranch>(
    `/api/v1/admin/branches/${encodeURIComponent(id)}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteBranch(id: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/branches/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

// --- Events ---

export type ZonePayload = {
  name: string;
  color?: string;
  category?: string;
};

export type CreateEventPayload = {
  nameTh: string;
  slug?: string;
  category?: string;
  description?: string;
  branchId?: string;
  floorId?: string;
  startDate: string;
  endDate: string;
  openTime?: string;
  closeTime?: string;
  status: "DRAFT" | "UPCOMING" | "OPEN" | "CLOSED" | "CANCELLED";
  zoneArea?: string;
  highlights?: Record<string, string>;
  terms?: string[];
  prohibitedCategories?: string[];
  hiddenRules?: number[];
  hiddenProhibited?: number[];
  zones?: ZonePayload[];
};

export function createEvent(payload: CreateEventPayload) {
  return apiFetch<{ id: string }>("/api/v1/admin/events", {
    method: "POST",
    body: payload,
  });
}

export function updateEvent(id: string, payload: CreateEventPayload) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/events/${encodeURIComponent(id)}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteEvent(id: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/events/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

// --- Booths ---

export type CreateBoothPayload = {
  eventId: string;
  zoneId?: string;
  branchId?: string;
  floorId?: string;
  code: string;
  widthM: number;
  lengthM: number;
  price: number;
  deposit: number;
  position?: { x: number; y: number; w: number; h: number };
  status?: "AVAILABLE" | "HIDDEN";
};

export function createBooth(payload: CreateBoothPayload) {
  return apiFetch<{ id: string }>("/api/v1/admin/booths", {
    method: "POST",
    body: payload,
  });
}

/**
 * Edit a booth that already exists (typically to correct a mistyped price).
 *
 * The backend writes widthM / lengthM / price / deposit unconditionally — it
 * does NOT merge partial payloads — so every call must carry the full set,
 * otherwise the omitted columns are reset to 0. `status` is likewise cast to
 * the booth_status enum, so it must be a valid value, never an empty string.
 * `code` is intentionally absent: the update handler ignores it.
 */
export type UpdateBoothPayload = {
  widthM: number;
  lengthM: number;
  price: number;
  deposit: number;
  status: BoothStatus;
  zoneId?: string;
  position?: { x: number; y: number; w: number; h: number };
};

export function updateBooth(id: string, payload: UpdateBoothPayload) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/booths/${encodeURIComponent(id)}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteBooth(id: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/booths/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

// --- Branch-level floorplan upload ---

export type UploadFloorplanPayload = {
  branchId: string;
  floorNumber: number;
  floorName?: string;
};

export async function uploadBranchFloorplan(
  file: File,
  payload: UploadFloorplanPayload,
  token: string,
): Promise<{ floorPlanUrl: string }> {
  return multipartUpload("/api/v1/admin/floorplans", file, token, {
    branchId: payload.branchId,
    floorNumber: String(payload.floorNumber),
    ...(payload.floorName ? { floorName: payload.floorName } : {}),
  });
}

// --- Per-event media uploads ---

export async function uploadEventFloorplan(
  eventId: string,
  file: File,
  token: string,
): Promise<{ floorPlanUrl: string }> {
  return multipartUpload(`/api/v1/admin/events/${encodeURIComponent(eventId)}/floorplan`, file, token);
}

export async function uploadEventCover(
  eventId: string,
  file: File,
  token: string,
): Promise<{ coverUrl: string }> {
  return multipartUpload(`/api/v1/admin/events/${encodeURIComponent(eventId)}/cover`, file, token);
}

export async function appendEventGallery(
  eventId: string,
  file: File,
  token: string,
): Promise<{ url: string }> {
  return multipartUpload(`/api/v1/admin/events/${encodeURIComponent(eventId)}/gallery`, file, token);
}

export function removeEventGallery(eventId: string, url: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/events/${encodeURIComponent(eventId)}/gallery`,
    { method: "DELETE", body: { url } },
  );
}

export async function appendEventDocument(
  eventId: string,
  file: File,
  label: string,
  token: string,
): Promise<{ label: string; url: string }> {
  return multipartUpload(
    `/api/v1/admin/events/${encodeURIComponent(eventId)}/documents`,
    file,
    token,
    { label },
  );
}

export function removeEventDocument(eventId: string, url: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/events/${encodeURIComponent(eventId)}/documents`,
    { method: "DELETE", body: { url } },
  );
}

// --- Per-branch gallery (ภาพบรรยากาศห้าง) ---
//
// ⚠️ These three routes DO NOT EXIST on the API yet — every call currently
// returns 404. They mirror the event gallery contract one level up (branch
// instead of event) so the backend has an obvious shape to implement:
//
//   GET    /api/v1/branches/:id/gallery          -> { images: BranchGalleryImage[] }
//   POST   /api/v1/admin/branches/:id/gallery    multipart: file, caption?
//                                                -> BranchGalleryImage
//   DELETE /api/v1/admin/branches/:id/gallery    body: { url }
//
// Uploads go through the backend rather than straight to Supabase Storage for
// the reason documented in lib/storage/upload.ts: admin writes trip the default
// storage.objects RLS policies, so the service-role key has to do it.

export type BranchGalleryImage = {
  url: string;
  caption?: string;
  uploadedAt?: string;
};

export function listBranchGallery(branchId: string) {
  return apiFetch<{ images: BranchGalleryImage[] }>(
    `/api/v1/branches/${encodeURIComponent(branchId)}/gallery`,
  );
}

export async function appendBranchGallery(
  branchId: string,
  file: File,
  token: string,
  caption?: string,
): Promise<BranchGalleryImage> {
  return multipartUpload<BranchGalleryImage>(
    `/api/v1/admin/branches/${encodeURIComponent(branchId)}/gallery`,
    file,
    token,
    caption ? { caption } : {},
  );
}

export function removeBranchGallery(branchId: string, url: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/branches/${encodeURIComponent(branchId)}/gallery`,
    { method: "DELETE", body: { url } },
  );
}

export type BulkBoothPayload = {
  prefix: string;
  count: number;
  price: number;
  deposit?: number;
  category?: string;
};

export type BulkBoothResult = Array<{
  id: string;
  eventId: string;
  code: string;
  price: number;
  status: string;
}>;

export function bulkCreateBooths(eventId: string, payload: BulkBoothPayload) {
  return apiFetch<BulkBoothResult>(
    `/api/v1/admin/events/${encodeURIComponent(eventId)}/booths/bulk`,
    { method: "POST", body: payload },
  );
}

// Shared multipart helper for admin uploads. Bypasses apiFetch's JSON
// serializer so the browser can set the multipart boundary; unwraps the
// envelope so callers get the inner `data` object directly.
async function multipartUpload<T>(
  path: string,
  file: File,
  token: string,
  extraFields: Record<string, string> = {},
): Promise<T> {
  const BASE = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080");
  const fd = new FormData();
  fd.append("file", file);
  for (const [k, v] of Object.entries(extraFields)) fd.append(k, v);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: fd,
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "อัปโหลดไม่สำเร็จ");
  }
  return data.data as T;
}

// --- Mutations ---

export function approveBooking(code: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/bookings/${encodeURIComponent(code)}/approve`,
    { method: "PATCH" },
  );
}

export function rejectBooking(code: string, reason: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/bookings/${encodeURIComponent(code)}/reject`,
    { method: "PATCH", body: { reason } },
  );
}

export function suspendAdminUser(id: string, reason: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/suspend`,
    { method: "PATCH", body: { reason } },
  );
}

export function restoreAdminUser(id: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/restore`,
    { method: "PATCH" },
  );
}

// Signup approval. Both endpoints are still to be built on the Go side — the
// paths below mirror the suspend/restore pair already there, so wiring them up
// should be a matter of registering two routes. Until they exist these calls
// return 404 and the UI surfaces the error rather than pretending it worked.
//
// Approving must flip `app_metadata.user_status` to APPROVED (not
// user_metadata — the client can write that one), which is what the frontend
// reads in lib/auth/userStatus.ts.

export function approveAdminUser(id: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/approve`,
    { method: "PATCH" },
  );
}

export function rejectAdminUser(id: string, reason: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/reject`,
    { method: "PATCH", body: { reason } },
  );
}

