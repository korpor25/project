import Link from "next/link";
import { Bookmark, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { coverStyle } from "@/lib/eventCover";
import { formatThaiDate } from "@/lib/pricing";
import type { EventDetail } from "@/types/domain";

export function EventHero({ event }: { event: EventDetail }) {
  return (
    <section className="relative isolate text-white" style={coverStyle(event)}>
      <div className="absolute inset-0 bg-foreground/55" aria-hidden />
      <Container className="relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-wider opacity-70">
            หน้าหลัก / พื้นที่ให้เช่า / รายละเอียดอีเวนต์
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {event.nameTh}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatThaiDate(event.startDate)} – {formatThaiDate(event.endDate)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.floor}, {event.branch}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/events/${event.slug}/booths`}>
              <Button size="lg">เลือกบูธที่ต้องการ</Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
              <Bookmark className="h-4 w-4" />
              บันทึกอีเวนต์นี้
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
