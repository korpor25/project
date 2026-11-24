import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/about/GalleryGrid";
import { galleryVenues, getGalleryVenue } from "@/lib/gallery";
import { formatThaiDateRange } from "@/lib/pricing";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return galleryVenues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const venue = getGalleryVenue(slug);
  if (!venue) return {};
  return {
    title: `ภาพบรรยากาศ ${venue.name}`,
    description: `รวมภาพพื้นที่บูธและงานอีเวนต์ที่ ${venue.name} ${venue.images.length} รูป`,
    alternates: { canonical: `/gallery/${venue.slug}` },
  };
}

export default async function GalleryVenuePage({ params }: Params) {
  const { slug } = await params;
  const venue = getGalleryVenue(slug);
  if (!venue) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        ศูนย์การค้าทั้งหมด
      </Link>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{venue.name}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {venue.province && <span>{venue.province}</span>}
          {venue.startDate && venue.endDate && (
            <>
              <span aria-hidden>·</span>
              <span>{formatThaiDateRange(venue.startDate, venue.endDate)}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{venue.images.length} รูป</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          คลิกที่รูปเพื่อดูขนาดเต็ม
        </p>
      </header>

      <div className="mt-10">
        <GalleryGrid images={venue.images} />
      </div>
    </div>
  );
}
