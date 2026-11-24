import Link from "next/link";
import { Bookmark, Building2, CalendarDays, Tag, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { daysRemaining, formatThaiDate, formatTHB } from "@/lib/pricing";
import type { EventDetail } from "@/types/domain";

export function EventStickyCard({
  event,
  isLoggedIn,
}: {
  event: EventDetail;
  isLoggedIn: boolean;
}) {
  const days =
    Math.round(
      (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;
  const daysLeft = daysRemaining(event.endDate);
  return (
    <aside className="sticky top-6 self-start rounded-2xl border border-border bg-card p-5 shadow-md">
      {/* Icon rather than an emoji: emoji render differently on every platform
          and carry a colour the brand palette never chose. */}
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        ที่จัดโดย
      </p>
      <p className="text-lg font-bold">{event.branch}</p>

      <ul className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
        <li className="flex items-start gap-3">
          <Badge tone={daysLeft <= 3 ? "danger" : "success"} className="mt-0.5">
            {daysLeft === 0 ? "หมดเวลาแล้ว" : `เหลือเวลา ${daysLeft} วัน`}
          </Badge>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> วันที่จัดงาน
          </span>
          <span className="font-medium text-right">
            {formatThaiDate(event.startDate)}<br />— {formatThaiDate(event.endDate)} ({days} วัน)
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" /> ประเภทสินค้า
          </span>
          <span className="text-right text-xs font-medium">
            Fashion, Food, Beauty, Lifestyle
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" /> ราคาเริ่ม
          </span>
          {/* The event page is public for search engines, so the price stays
              behind sign-in the same way the listing cards do it. */}
          {isLoggedIn ? (
            <span className="font-bold text-primary">
              {formatTHB(event.startingPrice)} / Event
            </span>
          ) : (
            <Link
              href={`/login?next=/events/${event.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              เข้าสู่ระบบเพื่อดูราคา
            </Link>
          )}
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" /> ผู้สมัครแล้ว
          </span>
          <span className="font-medium">{event.totalBooths - event.remainingBooths} ราย</span>
        </li>
      </ul>

      <div className="mt-5 space-y-2">
        <Link href={`/events/${event.slug}/booths`}>
          <Button size="lg" className="w-full">เลือกบูธจากแผนผัง</Button>
        </Link>
        <Button size="lg" variant="outline" className="w-full">
          <Bookmark className="h-4 w-4" />
          บันทึกอีเวนต์นี้
        </Button>
      </div>
    </aside>
  );
}
