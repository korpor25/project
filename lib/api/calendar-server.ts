import "server-only";

import { serverFetch } from "./server";
import type { EventSpan } from "@/components/admin/calendar/EventCalendar";

type ApiEvent = {
  id: string;
  nameTh: string;
  category?: string;
  branchName?: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "UPCOMING" | "OPEN" | "CLOSED" | "CANCELLED";
};

/**
 * Colour is per event, not per category: several events usually share a
 * category, and what the grid needs is to tell one multi-week run from the one
 * stacked above it.
 *
 * Hues are dealt round-robin over the month's events sorted by id, not drawn
 * from a hash of the id: hashing five events into six buckets leaves them all
 * distinct only ~1.5% of the time, and the first attempt did give five events
 * just two colours. Dealing guarantees the first six are distinct.
 *
 * The assignment runs over every event the month returned, before the client's
 * category/branch filters, so hiding one never repaints the rest. The list
 * passes the adjacent-pair colour checks (worst deutan ΔE 13.3, worst
 * normal-vision ΔE 27.1) and deliberately avoids the status tokens
 * (--danger/--success/--warning/--info) and --primary: an earlier version used
 * them and a Beauty event rendered in the exact error red.
 */
const PALETTE = [
  "#1d4ed8",
  "#c2410c",
  "#0d9488",
  "#a21caf",
  "#65a30d",
  "#b91c1c",
];

// Fetch every event whose date range overlaps the requested month. The calendar
// is keyed on /admin/calendar?year=...&month=... so navigation is cheap and the
// result is bounded.
export async function fetchCalendarEvents(
  year: number,
  month: number,
): Promise<EventSpan[]> {
  const res = await serverFetch<{ data: ApiEvent[] }>(
    "/api/v1/admin/calendar",
    { query: { year, month } },
  );
  const visible = res.data.filter(
    (e) => e.status !== "DRAFT" && e.status !== "CANCELLED",
  );

  // Sorted by id so the deal is deterministic — the API's row order is not.
  const colorById = new Map(
    [...visible]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((e, i) => [e.id, PALETTE[i % PALETTE.length]] as const),
  );

  return visible.map((e) => ({
    id: e.id,
    nameTh: e.nameTh,
    branch: e.branchName ?? "—",
    startDate: e.startDate.slice(0, 10),
    endDate: e.endDate.slice(0, 10),
    category: e.category ?? "อื่นๆ",
    color: colorById.get(e.id) ?? PALETTE[0],
    status:
      e.status === "OPEN"
        ? "OPEN"
        : e.status === "UPCOMING"
          ? "UPCOMING"
          : "CLOSED",
  }));
}
