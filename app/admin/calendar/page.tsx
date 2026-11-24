import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { EventCalendar } from "@/components/admin/calendar/EventCalendar";
import { fetchCalendarEvents } from "@/lib/api/calendar-server";

export const dynamic = "force-dynamic";

function intInRange(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();

  // The calendar's arrows write these params, so they are user-editable. A
  // non-numeric or out-of-range value would otherwise reach TH_MONTHS[98] and
  // render "undefined 2569" over a rolled-over grid.
  const year = intInRange(sp.year, now.getFullYear(), 1970, 2200);
  const month = intInRange(sp.month, now.getMonth() + 1, 1, 12);

  const events = await fetchCalendarEvents(year, month);

  return (
    <>
      <AdminTopbar
        title="ปฏิทินอีเวนต์"
        subtitle="ดูช่วงเวลาอีเวนต์ทั้งหมดและสลับสาขา/หมวดหมู่"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <EventCalendar events={events} year={year} month={month - 1} />
      </main>
    </>
  );
}
