import { EventGrid } from "@/components/events/EventGrid";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { fetchEvents } from "@/lib/api/events";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "พื้นที่ให้เช่า — เช่าพื้นที่ในห้าง ออกบูธขายสินค้า",
  description:
    "รวมพื้นที่ให้เช่าและงานออกบูธในศูนย์การค้าทั่วประเทศ ค้นหาทำเลขายของตามจังหวัดและหมวดหมู่สินค้า ดูพื้นที่ว่างและจองออนไลน์ได้ทันที",
  alternates: { canonical: "/events" },
};

export default async function EventsListPage() {
  const [events, supabase] = await Promise.all([fetchEvents(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-[#33446b] to-[#1a2438] py-12 text-white">
        <Container>
          <h1 className="text-3xl font-bold sm:text-4xl">เลือกอีเวนต์ที่ใช่ของคุณ</h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            ค้นหาอีเวนต์ที่เปิดรับจอง พร้อมราคาเริ่มต้นและบูธที่ว่าง
          </p>
        </Container>
      </section>

      <Container className="space-y-6 py-10">
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีอีเวนต์ที่เปิดรับจอง — กลับมาดูใหม่อีกครั้ง
          </p>
        ) : (
          <EventGrid events={events} isLoggedIn={isLoggedIn} />
        )}
      </Container>
    </>
  );
}
