import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Images, MapPin } from "lucide-react";
import { galleryVenues, venueCover } from "@/lib/gallery";
import { formatThaiDateRange } from "@/lib/pricing";

/**
 * Folder view of the photo gallery — one card per mall, opening that mall's
 * shots at /gallery/[slug].
 */
export function GalleryVenueGrid() {
  if (galleryVenues.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
        ยังไม่มีรูปบรรยากาศในระบบ
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {galleryVenues.map((v) => (
        <li key={v.slug}>
          <Link
            href={`/gallery/${v.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image
                src={venueCover(v)}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Images className="h-3 w-3" />
                {v.images.length} รูป
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-bold leading-snug group-hover:text-primary">
                {v.name}
              </h3>
              {v.province && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {v.province}
                </p>
              )}
              {v.startDate && v.endDate && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  {formatThaiDateRange(v.startDate, v.endDate)}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                ดูรูปทั้งหมด
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
