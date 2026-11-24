import type { Metadata } from "next";
import { GalleryVenueGrid } from "@/components/about/GalleryVenueGrid";

export const metadata: Metadata = {
  title: "คลังรูปภาพ",
  description:
    "รวมภาพบรรยากาศพื้นที่บูธและงานอีเวนต์ที่ผ่านมา แยกตามศูนย์การค้า",
  alternates: { canonical: "/gallery" },
};

export default function GalleryIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">คลังรูปภาพ</h1>
        <p className="mt-3 text-muted-foreground">
          เลือกศูนย์การค้าเพื่อดูภาพพื้นที่จัดแสดงและงานอีเวนต์ที่ผ่านมา
        </p>
      </header>

      <div className="mt-10">
        <GalleryVenueGrid />
      </div>
    </div>
  );
}
