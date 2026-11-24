import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EventBottomCards } from "@/components/events/EventBottomCards";
import { EventHero } from "@/components/events/EventHero";
import { EventRulesSection } from "@/components/events/EventRulesSection";
import { EventStickyCard } from "@/components/events/EventStickyCard";
import { fetchEvent } from "@/lib/api/events";
import { formatThaiDate, formatThaiDateRange } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;
export const dynamicParams = true;

/**
 * Per-event title and description. These pages are the ones that can rank for
 * "เช่าพื้นที่ [ชื่อห้าง]" or "ออกบูธ [ชื่องาน]" — a single shared title across
 * every event would make them compete with each other instead.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEvent(slug);
  if (!event) return { title: "ไม่พบอีเวนต์" };

  const title = `${event.nameTh} — เช่าพื้นที่ออกบูธ ${event.branch}`;
  const description =
    `เช่าพื้นที่ขายของและออกบูธในงาน ${event.nameTh} ที่ ${event.branch} ` +
    `${formatThaiDate(event.startDate)} – ${formatThaiDate(event.endDate)} ` +
    `เหลือ ${event.remainingBooths} จาก ${event.totalBooths} บูธ ` +
    "ดูผังพื้นที่และจองออนไลน์ได้ทันที";

  return {
    title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title,
      description,
      images: event.cover ? [{ url: event.cover }] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, supabase] = await Promise.all([fetchEvent(slug), createClient()]);
  if (!event) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <>
      <EventHero event={event} />
      <Container className="grid gap-8 py-10 pb-28 lg:grid-cols-[1fr_340px] lg:pb-10">
        <div>
          <h2 className="text-xl font-bold">รายละเอียดอีเวนต์</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
            {/* Where and when belong together — one block split down the
                middle, instead of two cards you read separately. Spans the
                whole row on phones and two of three columns from sm. */}
            <div className="col-span-2 rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="pr-3">
                  <p className="text-xs text-muted-foreground">สถานที่</p>
                  <p className="mt-1 text-sm font-medium">{event.branch}</p>
                  <p className="text-sm text-muted-foreground">{event.zoneArea}</p>
                </div>
                <div className="pl-3">
                  <p className="text-xs text-muted-foreground">วันที่จัดงาน</p>
                  {/* Compact range — the long form wrapped onto three lines
                      inside half a card on a phone. */}
                  <p className="mt-1 text-sm font-medium">
                    {formatThaiDateRange(event.startDate, event.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dayCount(event)} วัน
                  </p>
                </div>
              </div>
            </div>
            <InfoCell label="ขนาดบูธ" value="3×3 / 3×6 ตร.ม." />
            <InfoCell label="ประเภทสินค้า" value={event.category} />
            <InfoCell label="บูธทั้งหมด" value={`${event.totalBooths} บูธ`} />
            <InfoCell
              label="เวลาเปิด-ปิด"
              value={`${event.openTime} - ${event.closeTime} น.`}
            />
          </div>

          <EventRulesSection event={event} />

          {event.gallery.length > 0 && (
            <section className="mt-8 sm:mt-10">
              <h2 className="mb-3 text-xl font-bold sm:mb-4">บรรยากาศภายในงาน</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {event.gallery.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="aspect-[4/3] rounded-lg object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          <EventBottomCards event={event} />
        </div>
        <EventStickyCard event={event} isLoggedIn={isLoggedIn} />
      </Container>

      {/* Below lg the sticky sidebar drops to the very bottom of the page, so
          the booking CTA sat behind the whole description. This bar keeps it in
          reach the entire time. Right padding clears the floating contact
          button, which is pinned to the same corner. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 py-3 pl-4 pr-24 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              พื้นที่ว่าง
            </p>
            <p className="truncate text-sm font-bold">
              {event.remainingBooths} / {event.totalBooths} บูธ
            </p>
          </div>
          <Link href={`/events/${event.slug}/booths`} className="shrink-0">
            <Button size="lg">เลือกบูธ</Button>
          </Link>
        </div>
      </div>
    </>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm font-medium">{value}</p>
    </div>
  );
}

function dayCount(e: { startDate: string; endDate: string }): number {
  return (
    Math.round(
      (new Date(e.endDate).getTime() - new Date(e.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1
  );
}
