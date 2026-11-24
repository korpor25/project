import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fetchEvent, fetchEventBooths } from "@/lib/api/events";

// Auth is enforced for the whole /events tree in middleware.
export const dynamic = "force-dynamic"; // depends on searchParams.booth

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ booth?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [event, booths] = await Promise.all([
    fetchEvent(slug),
    fetchEventBooths(slug),
  ]);
  if (!event) notFound();

  // `?booth=` carries one code, or several comma-separated when the renter
  // picked more than one on the plan screen. Order follows the URL so the
  // wizard reads back in the order they were chosen.
  const selected = (sp.booth ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const chosen = selected
    .map((token) => booths.find((b) => b.code === token || b.id === token))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  if (chosen.length === 0) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-lg font-semibold">ยังไม่ได้เลือกบูธ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            กรุณาเลือกบูธจากแผนผังก่อนดำเนินการจอง
          </p>
          <div className="mt-4">
            <Link href={`/events/${event.slug}/booths`}>
              <Button>เลือกบูธ</Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-[#3a2916] via-[#5a4326] to-[#3a2916] py-10 text-white">
        <Container>
          <p className="text-xs uppercase tracking-wider opacity-70">
            หน้าหลัก / {event.nameTh} / กรอกข้อมูลการจอง
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">กรอกข้อมูลการจอง</h1>
          <p className="mt-1 text-sm opacity-80">
            กรุณากรอกข้อมูลให้ครบถ้วน ระบบจะส่งให้ Admin พิจารณาหลังยืนยัน
          </p>
        </Container>
      </section>

      <Container className="py-8">
        <BookingWizard event={event} booths={chosen} />
      </Container>
    </>
  );
}
