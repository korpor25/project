import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EventStatusPill } from "@/components/ui/StatusPill";
import { coverStyle } from "@/lib/eventCover";
import { formatThaiDate, formatTHB } from "@/lib/pricing";
import type { EventSummary } from "@/types/domain";

export function EventCard({ event, isLoggedIn }: { event: EventSummary; isLoggedIn: boolean }) {
  return (
    // Fixed share of the viewport inside the phone swipe rows, auto once the
    // parent turns back into a grid at md.
    <li className="w-[78%] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:w-auto">
      <Link href={`/events/${event.slug}`} className="block">
        <div className="relative aspect-[16/9]" style={coverStyle(event)} aria-hidden>
          <div className="absolute right-3 top-3">
            <EventStatusPill status={event.status} />
          </div>
          <div className="absolute left-3 bottom-3">
            <Badge tone="primary">{event.category}</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold leading-snug">{event.nameTh}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatThaiDate(event.startDate)} – {formatThaiDate(event.endDate)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.branch} • {event.province}
          </p>
          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            {isLoggedIn ? (
              <div>
                <p className="text-xs text-muted-foreground">เริ่ม</p>
                <p className="text-xl font-bold text-primary">{formatTHB(event.startingPrice)}</p>
              </div>
            ) : (
              <p className="text-xs text-primary">เข้าสู่ระบบเพื่อดูราคา</p>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{event.remainingBooths}</span> /{" "}
              {event.totalBooths} บูธเหลือ
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
