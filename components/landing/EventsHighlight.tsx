import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fetchEvents } from "@/lib/api/events";
import { coverStyle } from "@/lib/eventCover";
import { formatThaiDate } from "@/lib/pricing";

export async function EventsHighlight() {
  // Show up to 3 events. Highlight reel — if the DB only has a couple, show
  // what's there.
  const all = await fetchEvents();
  const events = all
    .filter((e) => e.status === "OPEN" || e.status === "UPCOMING")
    .slice(0, 3);

  return (
    <section className="bg-muted/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Event ที่กำลังเปิดจอง</h2>
          <Link href="/events" className="text-sm text-primary hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            ยังไม่มีอีเวนต์ที่กำลังเปิดรับจอง — กลับมาดูใหม่อีกครั้ง
          </p>
        ) : (
          <ul className="swipe-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {events.map((e) => (
              <li
                key={e.id}
                className="w-[78%] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:w-auto"
              >
                <div
                  className="relative aspect-[16/9]"
                  style={coverStyle(e)}
                  aria-hidden
                >
                  <div className="absolute right-3 top-3">
                    <Badge tone={e.status === "OPEN" ? "success" : "info"}>
                      {e.status === "OPEN" ? "เปิดจอง" : "เร็วๆ นี้"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-lg font-bold">{e.nameTh}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />{" "}
                    {formatThaiDate(e.startDate)} – {formatThaiDate(e.endDate)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {e.branch}
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/events/${e.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
