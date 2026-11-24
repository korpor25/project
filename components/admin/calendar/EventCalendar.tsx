"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatThaiDateRange } from "@/lib/pricing";

export type EventSpan = {
  id: string;
  nameTh: string;
  branch: string;
  startDate: string;
  endDate: string;
  category: string;
  color: string;
  status: "OPEN" | "UPCOMING" | "CLOSED";
};

const TH_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const TH_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/** Bars deeper than this collapse into a "+N" line for that week. */
const MAX_LANES = 3;

type Cell = { key: string; date: number; inMonth: boolean; iso: string };

type Segment = {
  event: EventSpan;
  startCol: number;
  endCol: number;
  /** The run continues past this week — draw a flat edge instead of a cap. */
  clippedLeft: boolean;
  clippedRight: boolean;
};

export function EventCalendar({
  events: EVENTS,
  year,
  month,
}: {
  events: EventSpan[];
  year: number;
  month: number; // 0-indexed
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState("ทั้งหมด");
  const [branch, setBranch] = useState("ทุกสาขา");

  // The visible month lives in the URL, not in local state. The server only
  // fetches the events overlapping ?year&month, so a local-state month would
  // move the grid while `EVENTS` stayed on whatever month loaded first — which
  // is exactly why every month used to show the same events.
  const goTo = (y: number, m: number) => {
    startTransition(() => {
      router.push(`/admin/calendar?year=${y}&month=${m + 1}`, {
        scroll: false,
      });
    });
  };

  const go = (delta: number) => {
    const m = month + delta;
    if (m < 0) goTo(year - 1, 11);
    else if (m > 11) goTo(year + 1, 0);
    else goTo(year, m);
  };

  const branches = useMemo(
    () => Array.from(new Set(EVENTS.map((e) => e.branch))).sort(),
    [EVENTS],
  );

  const filtered = EVENTS.filter(
    (e) =>
      (category === "ทั้งหมด" || e.category === category) &&
      (branch === "ทุกสาขา" || e.branch === branch),
  );

  const weeks = useMemo(() => {
    const cells = buildMonthGrid(year, month);
    return Array.from({ length: cells.length / 7 }, (_, i) =>
      cells.slice(i * 7, i * 7 + 7),
    );
  }, [year, month]);

  // Compared as "YYYY-MM-DD" strings rather than Date objects: startDate is a
  // bare date that parses as UTC midnight, while new Date(year, month, 1) is
  // local midnight, so comparing the two mixes timezones.
  const firstIso = isoOf(year, month, 1);
  const lastIso = isoOf(year, month + 1, 0);
  const monthEvents = filtered.filter(
    (e) =>
      e.endDate.slice(0, 10) >= firstIso && e.startDate.slice(0, 10) <= lastIso,
  );

  // Lanes are assigned once for the month so a multi-week bar keeps its row.
  const lanes = assignLanes(filtered);
  const today = todayIso();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={pending}
              className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-50"
              aria-label="เดือนก่อน"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[9.5rem] text-center text-lg font-bold">
              {TH_MONTHS[month]} {year + 543}
            </h2>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={pending}
              className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-50"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                goTo(now.getFullYear(), now.getMonth());
              }}
              disabled={pending}
              className="ml-1 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              วันนี้
            </button>
          </div>

          {/* Both filters sit together — the branch one used to be an inert
              <Select> stranded in the sidebar with no handler attached. */}
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 w-auto"
              aria-label="กรองตามสาขา"
            >
              <option>ทุกสาขา</option>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-auto"
              aria-label="กรองตามหมวดหมู่"
            >
              <option>ทั้งหมด</option>
              <option>Fashion</option>
              <option>Food</option>
              <option>Beauty</option>
              <option>Lifestyle</option>
              <option>Tech</option>
              <option>Pet</option>
            </Select>
            <Link href="/admin/events/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                สร้างอีเวนต์
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-0.5 pb-1.5 text-center text-xs font-semibold text-muted-foreground">
          {TH_DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div
          className={`space-y-0.5 transition-opacity ${pending ? "opacity-60" : ""}`}
        >
          {weeks.map((week) => (
            <WeekRow
              key={week[0].key}
              week={week}
              events={filtered}
              lanes={lanes}
              today={today}
            />
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          อีเวนต์ในเดือนนี้
        </h3>
        <p className="text-xs text-muted-foreground">
          {monthEvents.length} รายการ
        </p>

        {monthEvents.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
            ไม่มีอีเวนต์ในเดือนนี้
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {monthEvents.map((e) => (
              <li key={e.id} className="flex items-start gap-2.5 py-3">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: e.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.nameTh}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatThaiDateRange(e.startDate, e.endDate)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {e.branch}
                  </p>
                </div>
                <Badge
                  tone={
                    e.status === "OPEN"
                      ? "success"
                      : e.status === "UPCOMING"
                        ? "info"
                        : "neutral"
                  }
                >
                  {e.status === "OPEN"
                    ? "เปิดจอง"
                    : e.status === "UPCOMING"
                      ? "เร็วๆ นี้"
                      : "ปิด"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

/**
 * One week of the grid. Day backgrounds are painted by an absolutely
 * positioned layer so the row's height follows however many event bars land in
 * it, while the bars themselves share the same 7-column geometry and can span
 * several days as a single element.
 */
function WeekRow({
  week,
  events,
  lanes,
  today,
}: {
  week: Cell[];
  events: EventSpan[];
  lanes: Map<string, number>;
  today: string;
}) {
  const segments = weekSegments(week, events);
  const shown = segments.filter((s) => (lanes.get(s.event.id) ?? 0) < MAX_LANES);
  const hiddenCount = segments.length - shown.length;

  return (
    <div className="relative min-h-[92px]">
      <div className="absolute inset-0 grid grid-cols-7 gap-0.5">
        {week.map((cell) => (
          <div
            key={cell.key}
            className={`rounded-md ${
              cell.inMonth
                ? "border border-border bg-card"
                : "border border-transparent bg-muted/30"
            } ${cell.iso === today ? "ring-2 ring-primary" : ""}`}
          />
        ))}
      </div>

      <div className="relative pb-1.5">
        <div className="grid grid-cols-7 gap-0.5">
          {week.map((cell) => (
            <span
              key={cell.key}
              className={`px-1.5 pt-1.5 text-[11px] font-semibold ${
                cell.iso === today
                  ? "text-primary"
                  : cell.inMonth
                    ? ""
                    : "text-muted-foreground"
              }`}
            >
              {cell.date}
            </span>
          ))}
        </div>

        {/* Same grid-cols-7 gap-0.5 geometry as the day cells above and the
            backgrounds behind, with no padding of its own — any padding here
            shifts the columns out of alignment with the day boxes. */}
        <div className="mt-1 grid auto-rows-[20px] grid-cols-7 gap-0.5">
          {shown.map((seg) => (
              <span
                key={seg.event.id}
                title={`${seg.event.nameTh} · ${seg.event.branch}`}
                style={{
                  // A wash of the colour with the label in ordinary ink,
                  // rather than white on a saturated fill — white 11px text
                  // failed contrast on three of the old category colours. Mixed
                  // at 18%: with no hue to help it read, a neutral needs a bit
                  // more weight to separate from the white day cell.
                  background: `color-mix(in srgb, ${seg.event.color} 18%, white)`,
                  boxShadow: seg.clippedLeft
                    ? undefined
                    : `inset 3px 0 0 ${seg.event.color}`,
                  gridColumn: `${seg.startCol + 1} / span ${seg.endCol - seg.startCol + 1}`,
                  gridRow: (lanes.get(seg.event.id) ?? 0) + 1,
                }}
                className={`truncate text-[11px] font-medium leading-[20px] text-foreground ${
                  seg.clippedLeft ? "pl-1.5" : "pl-2.5"
                } pr-1.5 ${seg.clippedLeft ? "" : "rounded-l-sm"} ${
                  seg.clippedRight ? "" : "rounded-r-sm"
                }`}
              >
                {/* Only the week a run opens in carries the name; later weeks
                    are a bare bar. That was unreadable while every event was
                    the same grey, but now each event owns a hue the colour
                    carries the run and the repeated label was just noise. The
                    full name stays on the title tooltip and in the sidebar. */}
                {seg.clippedLeft ? "" : seg.event.nameTh}
              </span>
          ))}
          {hiddenCount > 0 && (
            <span
              style={{ gridColumn: "1 / span 7", gridRow: MAX_LANES + 1 }}
              className="px-1.5 text-[10px] text-muted-foreground"
            >
              +{hiddenCount} อีเวนต์
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Interval partitioning across the whole month, not per week: an event keeps
 * the same lane for its entire run, so a bar spanning three weeks stays on one
 * row instead of hopping at each week boundary.
 */
function assignLanes(events: EventSpan[]): Map<string, number> {
  const sorted = [...events].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      b.endDate.localeCompare(a.endDate) ||
      a.id.localeCompare(b.id),
  );

  const laneEnd: string[] = []; // last date occupied, per lane
  const lanes = new Map<string, number>();
  for (const e of sorted) {
    let lane = laneEnd.findIndex((end) => end < e.startDate);
    if (lane === -1) {
      laneEnd.push(e.endDate);
      lane = laneEnd.length - 1;
    } else {
      laneEnd[lane] = e.endDate;
    }
    lanes.set(e.id, lane);
  }
  return lanes;
}

/** Clip every event overlapping this week down to its column range. */
function weekSegments(week: Cell[], events: EventSpan[]): Segment[] {
  const weekStart = week[0].iso;
  const weekEnd = week[6].iso;

  return events
    .filter((e) => e.endDate >= weekStart && e.startDate <= weekEnd)
    .map((event) => {
      let startCol = week.findIndex((c) => c.iso >= event.startDate);
      if (startCol === -1) startCol = 0;
      let endCol = -1;
      for (let i = week.length - 1; i >= 0; i--) {
        if (week[i].iso <= event.endDate) {
          endCol = i;
          break;
        }
      }
      return {
        event,
        startCol,
        endCol,
        clippedLeft: event.startDate < weekStart,
        clippedRight: event.endDate > weekEnd,
      };
    })
    .filter((s) => s.endCol >= s.startCol);
}

function buildMonthGrid(year: number, month: number): Cell[] {
  const last = new Date(year, month + 1, 0);
  const startWeekday = new Date(year, month, 1).getDay();
  const cells: Cell[] = [];

  const prevLast = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevLast - i;
    cells.push({
      key: `prev-${d}`,
      date: d,
      inMonth: false,
      iso: isoOf(year, month - 1, d),
    });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push({
      key: `cur-${d}`,
      date: d,
      inMonth: true,
      iso: isoOf(year, month, d),
    });
  }
  // Fill to whole weeks only — a fixed 6th row left an empty strip most months.
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      key: `next-${next}`,
      date: next,
      inMonth: false,
      iso: isoOf(year, month + 1, next),
    });
    next++;
  }
  return cells;
}

function isoOf(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
