import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { RevenueReport } from "@/components/admin/reports/RevenueReport";
import {
  fetchRevenueTrend,
  fetchZoneBreakdown,
} from "@/lib/api/admin-server";
import { fetchAdminBookings } from "@/lib/api/bookings-server";

export const dynamic = "force-dynamic";

type Period = "week" | "month" | "quarter" | "year";

export default async function AdminRevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period: Period =
    sp.period === "month" || sp.period === "quarter" || sp.period === "year"
      ? sp.period
      : "week";

  const [trend, zones, txnRes] = await Promise.all([
    fetchRevenueTrend(period),
    fetchZoneBreakdown(),
    fetchAdminBookings({ status: "APPROVED", perPage: 10 }),
  ]);

  return (
    <>
      <AdminTopbar
        title="รายงานรายได้"
        subtitle="แนวโน้ม สัดส่วนตามโซน และรายการธุรกรรม"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <RevenueReport
          initialPeriod={period}
          trend={trend}
          zones={zones}
          transactions={txnRes.rows}
        />
      </main>
    </>
  );
}
