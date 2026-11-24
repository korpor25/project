import { notFound } from "next/navigation";
import { BoothSelector } from "@/components/booth/BoothSelector";
import { Container } from "@/components/ui/Container";
import { fetchEvent, fetchEventBooths } from "@/lib/api/events";

// Auth is enforced for the whole /events tree in middleware.
export const revalidate = 10; // booth status changes often
export const dynamicParams = true;

export default async function BoothSelectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, booths] = await Promise.all([
    fetchEvent(slug),
    fetchEventBooths(slug),
  ]);
  if (!event) notFound();

  return (
    <>
      <section className="bg-gradient-to-br from-[#3a2916] via-[#5a4326] to-[#3a2916] py-6 text-white sm:py-10">
        <Container>
          <p className="text-xs uppercase tracking-wider opacity-70">
            หน้าหลัก / {event.nameTh} / เลือกบูธ
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">เลือกบูธที่ต้องการจอง</h1>
          <p className="mt-1 text-sm opacity-80">
            แผนผังบูธอัปเดตแบบ Real-time — กรุณาเลือกบูธที่ว่างเพื่อดำเนินการต่อ
          </p>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <BoothSelector event={event} booths={booths} />
      </Container>
    </>
  );
}
