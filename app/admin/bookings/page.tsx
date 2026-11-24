import { Download } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  BookingKpiBar,
  computeKpis,
} from "@/components/admin/booking/BookingKpiBar";
import { BookingsTableShell } from "@/components/admin/booking/BookingsTable";
import { Button } from "@/components/ui/Button";
import { fetchAdminBookings } from "@/lib/api/bookings-server";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { rows: bookings } = await fetchAdminBookings({ perPage: 100 });

  return (
    <>
      <AdminTopbar
        title="การจองทั้งหมด"
        subtitle="ตรวจสอบ อนุมัติ และจัดการคำขอจองทั้งหมดในระบบ"
      />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
        <BookingKpiBar stats={computeKpis(bookings)} />
        <BookingsTableShell bookings={bookings} />
      </main>
    </>
  );
}
