import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { MyBookingsTable } from "@/components/booking/MyBookingsTable";
import { fetchMyBookings } from "@/lib/api/bookings-server";
import { ApiError } from "@/lib/api/error";

export const dynamic = "force-dynamic"; // depends on logged-in user

export default async function MyBookingsPage() {
  let bookings;
  try {
    bookings = await fetchMyBookings();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirect("/login?next=/bookings");
    }
    throw e;
  }

  const counts = {
    pending: bookings.filter((b) => b.status === "PENDING" || b.status === "REVIEWING").length,
    approved: bookings.filter((b) => b.status === "APPROVED").length,
    rejected: bookings.filter((b) => b.status === "REJECTED" || b.status === "CANCELLED").length,
  };

  return (
    <>
      <section className="bg-gradient-to-br from-navy via-[#33446b] to-[#1a2438] py-10 text-white">
        <Container>
          <h1 className="text-3xl font-bold">ประวัติการจองของฉัน</h1>
          <p className="mt-2 text-sm opacity-80">
            ดูสถานะการจองทั้งหมดและรายละเอียดการชำระเงินรายงวด
          </p>
        </Container>
      </section>

      <Container className="space-y-6 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="ทั้งหมด" value={bookings.length} tone="text-foreground" />
          <StatCard label="รออนุมัติ" value={counts.pending} tone="text-warning" />
          <StatCard label="อนุมัติแล้ว" value={counts.approved} tone="text-success" />
          <StatCard label="ปฏิเสธ / ยกเลิก" value={counts.rejected} tone="text-danger" />
        </div>
        <MyBookingsTable bookings={bookings} />
      </Container>
    </>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
