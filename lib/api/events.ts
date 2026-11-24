// Server-side data fetchers for event/booth pages.
//
// These run in React Server Components. They wrap the backend response in our
// frontend domain shapes (`EventSummary`, `EventDetail`, `Booth`) so the
// existing components — built against the mock data — keep working unchanged.
//
// Backend doesn't carry presentational fields (coverTone, gallery, documents);
// we synthesise defaults here so the UI looks right out of the box.

import type { Booth, EventDetail, EventSummary } from "@/types/domain";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Per-category cover gradients. Stored as plain CSS `linear-gradient(...)`
// strings so we can render via inline `style` — Tailwind v4 JIT doesn't reliably
// detect arbitrary-value classes (`from-[#hex]`) composed from runtime data.
const COVER_TONES: Record<string, string> = {
  Fashion:   "linear-gradient(135deg, #33446b, #1a2438)",
  Food:      "linear-gradient(135deg, #c75b32, #7e2d18)",
  Beauty:    "linear-gradient(135deg, #b07db8, #5d3263)",
  Lifestyle: "linear-gradient(135deg, #8c6a3f, #3a2916)",
  Tech:      "linear-gradient(135deg, #2f6cb2, #16365a)",
  Pet:       "linear-gradient(135deg, #c89656, #7a5429)",
};

const FALLBACK_TONE = "linear-gradient(135deg, #8c6a3f, #3a2916)";

type ApiEvent = {
  id: string;
  nameTh: string;
  slug?: string;
  category?: string;
  description?: string;
  branchId?: string;
  branchName?: string;
  province?: string;
  floorId?: string;
  floorName?: string;
  floorPlanUrl?: string;
  zoneArea?: string;
  startDate: string;
  endDate: string;
  openTime?: string;
  closeTime?: string;
  status: EventSummary["status"];
  startingPrice: number;
  remainingBooths: number;
  totalBooths: number;
  highlights?: Record<string, string> | string[];
  terms?: string[] | Record<string, unknown>;
  prohibitedCategories?: string[];
  hiddenRules?: number[];
  hiddenProhibited?: number[];
  coverUrl?: string;
  galleryUrls?: string[];
  documents?: Array<{ label: string; url: string }> | null;
};

type ApiBooth = {
  id: string;
  eventId: string;
  code: string;
  price: number;
  status: Booth["status"];
  widthM?: number;
  lengthM?: number;
  areaSqm?: number;
  zone?: string;
  tenantProductCategory?: string;
  tenantProductDetail?: string;
  paid?: boolean;
};

type EnvelopeOne<T> = { data: T };
type EnvelopeList<T> = { data: T[] };

async function get<T>(path: string, revalidate = 30): Promise<T | null> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

export async function fetchEvents(): Promise<EventSummary[]> {
  const data = await get<EnvelopeList<ApiEvent>>("/api/v1/events?perPage=50");
  if (!data) return [];
  return data.data.map(toEventSummary);
}

export async function fetchEvent(slug: string): Promise<EventDetail | null> {
  const data = await get<EnvelopeOne<{ event: ApiEvent }>>(
    `/api/v1/events/${encodeURIComponent(slug)}`,
  );
  if (!data) return null;
  return toEventDetail(data.data.event);
}

/**
 * Raw event used by the admin edit form. Strips presentational defaults so the
 * form can show / store the same fields the backend persists.
 */
export type AdminEventDraft = {
  id: string;
  nameTh: string;
  slug: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  status: "DRAFT" | "UPCOMING" | "OPEN" | "CLOSED" | "CANCELLED";
  branchId: string;
  branchName: string;
  zoneArea: string;
  floorPlanUrl?: string;
  terms: string[];
  prohibitedCategories: string[];
  hiddenRules: number[];
  hiddenProhibited: number[];
  coverUrl?: string;
  galleryUrls: string[];
  documents: Array<{ label: string; url: string }>;
};

export async function fetchAdminEvent(idOrSlug: string): Promise<AdminEventDraft | null> {
  const data = await get<EnvelopeOne<{ event: ApiEvent }>>(
    `/api/v1/events/${encodeURIComponent(idOrSlug)}`,
    0,
  );
  if (!data) return null;
  const e = data.data.event;
  return {
    id: e.id,
    nameTh: e.nameTh,
    slug: e.slug ?? "",
    category: e.category ?? "",
    description: e.description ?? "",
    startDate: e.startDate.slice(0, 10),
    endDate: e.endDate.slice(0, 10),
    openTime: (e.openTime ?? "").slice(0, 5),
    closeTime: (e.closeTime ?? "").slice(0, 5),
    status: (e.status as AdminEventDraft["status"]) ?? "DRAFT",
    branchId: e.branchId ?? "",
    branchName: e.branchName ?? "",
    zoneArea: e.zoneArea ?? "",
    floorPlanUrl: e.floorPlanUrl,
    terms: Array.isArray(e.terms) ? (e.terms as string[]) : [],
    prohibitedCategories: e.prohibitedCategories ?? [],
    hiddenRules: e.hiddenRules ?? [],
    hiddenProhibited: e.hiddenProhibited ?? [],
    coverUrl: e.coverUrl,
    galleryUrls: e.galleryUrls ?? [],
    documents: Array.isArray(e.documents) ? e.documents : [],
  };
}

/**
 * `key` accepts an event slug or id. Admin screens that edit booths pass
 * `revalidate: 0` so a refresh after a save shows the new values immediately.
 */
export async function fetchEventBooths(key: string, revalidate = 30): Promise<Booth[]> {
  const data = await get<EnvelopeList<ApiBooth>>(
    `/api/v1/events/${encodeURIComponent(key)}/booths`,
    revalidate,
  );
  if (!data) return [];
  return data.data.map(toBooth);
}

/**
 * Serializable seed for the create-event wizard when duplicating an existing
 * event. Reconstructs zones by grouping the source event's booths on their
 * `zone` name, carrying booth sizes and prices across. Media (cover/gallery/
 * floor plan) and dates are intentionally NOT included — those are re-entered.
 */
export type DuplicatePrefill = {
  sourceName: string;
  branchName: string;
  floor: string;
  description: string;
  terms: string[];
  zones: Array<{
    name: string;
    category: string;
    booths: Array<{ number: string; size: string; price: number }>;
  }>;
};

function formatBoothSize(w?: number, l?: number): string {
  if (!w || !l) return "2×2";
  return `${w}×${l}`;
}

export async function fetchEventDuplicatePrefill(
  idOrSlug: string,
): Promise<DuplicatePrefill | null> {
  const event = await fetchAdminEvent(idOrSlug);
  if (!event) return null;

  // Booths endpoint keys off slug; fall back to the id for slugless events.
  const booths = await fetchEventBooths(event.slug || idOrSlug);

  // zoneArea is stored as "Branch • Floor" by the create wizard — split it back.
  const [branchName = "", floor = ""] = event.zoneArea
    .split("•")
    .map((s) => s.trim());

  // Group booths into zones, preserving first-seen order.
  const zoneMap = new Map<string, DuplicatePrefill["zones"][number]>();
  for (const b of booths) {
    const key = b.zone?.trim() || "โซนหลัก";
    let zone = zoneMap.get(key);
    if (!zone) {
      zone = { name: key, category: key, booths: [] };
      zoneMap.set(key, zone);
    }
    zone.booths.push({
      number: b.code,
      size: formatBoothSize(b.widthM, b.lengthM),
      price: b.price,
    });
  }

  return {
    sourceName: event.nameTh,
    branchName,
    floor: floor || "ชั้น 1",
    description: event.description,
    terms: event.terms,
    zones: Array.from(zoneMap.values()),
  };
}

function toEventSummary(e: ApiEvent): EventSummary {
  return {
    id: e.id,
    // Use `||` not `??` — events created without a slug come back as "" from
    // the DB, and the empty string would build URLs like `/events//booths`
    // which 401-bounce off the user-auth catch-all route. Fall back to the
    // event UUID so links/API calls always resolve.
    slug: e.slug || e.id,
    nameTh: e.nameTh,
    branch: e.branchName ?? "—",
    province: e.province ?? "—",
    startDate: e.startDate.slice(0, 10),
    endDate: e.endDate.slice(0, 10),
    status: e.status,
    startingPrice: e.startingPrice ?? 0,
    category: e.category ?? "อื่นๆ",
    remainingBooths: e.remainingBooths ?? 0,
    totalBooths: e.totalBooths ?? 0,
    cover: e.coverUrl,
    coverTone: COVER_TONES[e.category ?? ""] ?? FALLBACK_TONE,
  };
}

function toEventDetail(e: ApiEvent): EventDetail {
  const summary = toEventSummary(e);
  const highlights = normalizeHighlights(e.highlights);
  const terms = Array.isArray(e.terms) ? (e.terms as string[]) : [];
  const docs = Array.isArray(e.documents)
    ? e.documents.map((d) => ({ label: d.label, href: d.url }))
    : [];
  return {
    ...summary,
    zoneArea: e.zoneArea ?? `${e.branchName ?? ""} • ${e.floorName ?? ""}`,
    floor: e.floorName ?? "",
    floorPlanUrl: e.floorPlanUrl,
    openTime: (e.openTime ?? "10:00").slice(0, 5),
    closeTime: (e.closeTime ?? "21:00").slice(0, 5),
    description: e.description ?? "",
    highlights,
    terms,
    prohibitedCategories: e.prohibitedCategories ?? [],
    hiddenRules: e.hiddenRules ?? [],
    hiddenProhibited: e.hiddenProhibited ?? [],
    cover: e.coverUrl,
    documents: docs,
    gallery: e.galleryUrls ?? [],
  };
}

function normalizeHighlights(h: ApiEvent["highlights"]): EventDetail["highlights"] {
  const fallback = {
    footTraffic: "—",
    topZone: "—",
    nearbyStores: "—",
    accessibility: "—",
  };
  if (!h || Array.isArray(h)) return fallback;
  return {
    footTraffic: h.footTraffic ?? fallback.footTraffic,
    topZone: h.topZone ?? fallback.topZone,
    nearbyStores: h.nearbyStores ?? fallback.nearbyStores,
    accessibility: h.accessibility ?? fallback.accessibility,
  };
}

function toBooth(b: ApiBooth): Booth {
  return {
    id: b.id,
    code: b.code,
    status: b.status,
    price: b.price,
    widthM: b.widthM,
    lengthM: b.lengthM,
    areaSqm: b.areaSqm,
    zone: b.zone,
    tenantProductCategory: b.tenantProductCategory,
    tenantProductDetail: b.tenantProductDetail,
    paid: b.paid,
  };
}
  
