"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { EventSummary } from "@/types/domain";
import { EventCard } from "./EventCard";
import { DEFAULT_FILTER, EventFilter, type EventFilterValue } from "./EventFilter";

export function EventGrid({ events, isLoggedIn }: { events: EventSummary[]; isLoggedIn: boolean }) {
  // The hero form on the landing page submits with ?province=&category=&status=
  // — seed the filter from those so users see scoped results immediately.
  const params = useSearchParams();
  const seeded = useMemo<EventFilterValue>(() => {
    const province = params.get("province") ?? "";
    const status = params.get("status") ?? "";
    const category = params.get("category") ?? "";
    return {
      ...DEFAULT_FILTER,
      province,
      status,
      // EventFilter doesn't have a category field; we fold it into `q` so the
      // text-match path still narrows the list. Most categories are also
      // present in event names (Fashion / Food / Beauty) so it's a reasonable
      // fallback until we add a proper category dropdown.
      q: category,
    };
  }, [params]);

  const [filter, setFilter] = useState<EventFilterValue>(seeded);

  const provinces = useMemo(() => uniq(events.map((e) => e.province)), [events]);
  const branches = useMemo(() => uniq(events.map((e) => e.branch)), [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filter.q && !e.nameTh.toLowerCase().includes(filter.q.toLowerCase()) &&
          !(e.category ?? "").toLowerCase().includes(filter.q.toLowerCase())) return false;
      if (filter.province && e.province !== filter.province) return false;
      if (filter.branch && e.branch !== filter.branch) return false;
      if (filter.status && e.status !== filter.status) return false;
      if (filter.month && e.startDate.slice(5, 7) !== filter.month) return false;
      return true;
    });
  }, [events, filter]);

  // Group by the month the event starts so each row answers "what is on in
  // <month>" — the question people actually browse with.
  const byMonth = useMemo(() => {
    const map = new Map<string, EventSummary[]>();
    for (const e of filtered) {
      const key = e.startDate.slice(0, 7); // yyyy-mm
      const bucket = map.get(key);
      if (bucket) bucket.push(e);
      else map.set(key, [e]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <>
      <EventFilter
        value={filter}
        branches={branches}
        provinces={provinces}
        onChange={setFilter}
      />
      {filtered.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
          ไม่พบอีเวนต์ที่ตรงกับเงื่อนไข ลองล้างตัวกรองดูครับ
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {byMonth.map(([ym, list]) => (
            <section key={ym}>
              <h2 className="mb-3 flex items-baseline gap-2 text-lg font-bold">
                {monthLabel(ym)}
                <span className="text-sm font-normal text-muted-foreground">
                  {list.length} อีเวนต์
                </span>
              </h2>
              <ul className="swipe-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                {list.map((e) => (
                  <EventCard key={e.id} event={e} isLoggedIn={isLoggedIn} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

/**
 * "2026-08" -> "สิงหาคม 2569". Read in UTC on purpose: the dates are bare
 * yyyy-mm-dd that Date parses as UTC midnight, so local getters would roll back
 * a month on any host west of Greenwich.
 */
function monthLabel(ym: string): string {
  const d = new Date(`${ym}-01T00:00:00Z`);
  const month = d.toLocaleDateString("th-TH", {
    month: "long",
    timeZone: "UTC",
  });
  return `${month} ${d.getUTCFullYear() + 543}`;
}
