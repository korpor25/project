import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { fetchEventBooths, fetchEvents } from "@/lib/api/events";
import { formatThaiDateRange, formatTHB } from "@/lib/pricing";

export async function RecommendedBooths({ isLoggedIn }: { isLoggedIn: boolean }) {
  const events = await fetchEvents();
  const openEvents = events
    .filter((e) => e.status === "OPEN" || e.status === "UPCOMING")
    .slice(0, 3);

  type Card = {
    eventSlug: string;
    branch: string;
    province: string;
    code: string;
    eventName: string;
    dateRange: string;
    price: number;
  };
  const picks: Card[] = [];
  for (const ev of openEvents) {
    if (picks.length >= 4) break;
    const booths = await fetchEventBooths(ev.slug);
    for (const b of booths) {
      if (picks.length >= 4) break;
      if (b.status !== "AVAILABLE") continue;
      picks.push({
        eventSlug: ev.slug,
        branch: ev.branch,
        province: ev.province,
        code: b.code,
        eventName: ev.nameTh,
        dateRange: formatThaiDateRange(ev.startDate, ev.endDate),
        price: b.price,
      });
    }
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Featured Spaces
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">พื้นที่แนะนำ</h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-primary" />
          </div>
          <Link
            href="/events"
            className="group flex items-center gap-1 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            ดูทั้งหมด
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {picks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-sm text-muted-foreground">
            ยังไม่มีบูธว่างให้แนะนำในขณะนี้
          </p>
        ) : (
          <ul className="swipe-row -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {picks.map((b) => {
              const href = isLoggedIn
                ? `/events/${b.eventSlug}/booths`
                : `/login?next=/events/${b.eventSlug}/booths`;

              return (
                <li
                  key={`${b.eventSlug}-${b.code}`}
                  className="group w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 sm:w-auto"
                >
                  {/* cover */}
                  {/* Shorter cover on phones: at 4:3 a 78%-wide card ran past
                      400px tall and pushed the price below the fold. */}
                  <div className="relative aspect-[16/10] bg-muted sm:aspect-[4/3]">
                    {/* Same shot on every card until booths carry their own
                        photo, and each card already names its booth in text —
                        so it is decorative and takes an empty alt rather than
                        repeating identical alt text four times. */}
                    <Image
                      src="/booth.png"
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        ว่าง
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-lg bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
                        บูธที่ <span className="font-bold">{b.code}</span>
                      </span>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-4">
                    {/* งานอะไร — promoted from a pill to the card title, since
                        it is the first thing a renter needs to identify. */}
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                      {b.eventName}
                    </h3>

                    <div className="mt-2.5 space-y-1.5 text-xs">
                      {/* ที่ไหน */}
                      <p className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="line-clamp-2">
                          {b.branch}
                          <span className="text-muted-foreground">
                            {" "}
                            · {b.province}
                          </span>
                        </span>
                      </p>
                      {/* วันไหนถึงไหน */}
                      <p className="flex items-start gap-1.5">
                        <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{b.dateRange}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-2 border-t border-border pt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          ราคาเริ่มต้น / ต่อวัน
                        </p>
                        {isLoggedIn ? (
                          <p className="text-xl font-bold text-primary leading-none">
                            {formatTHB(b.price)}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground leading-none">
                            เข้าสู่ระบบเพื่อดูราคา
                          </p>
                        )}
                      </div>
                      <Link
                        href={href}
                        className="shrink-0 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
