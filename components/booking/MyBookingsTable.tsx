import Link from "next/link";
import { Eye } from "lucide-react";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { formatThaiDate, formatTHB } from "@/lib/pricing";
import type { ApiBooking } from "@/lib/api/bookings";

export function MyBookingsTable({ bookings }: { bookings: ApiBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
        ยังไม่มีการจอง — เริ่มต้นจองบูธแรกได้เลย
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">เลขที่</th>
            <th className="px-4 py-3">อีเวนต์ / บูธ</th>
            <th className="px-4 py-3">วันที่จัดงาน</th>
            <th className="px-4 py-3 text-right">ยอดรวม</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((b) => (
            <tr key={b.code} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs">{b.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{b.eventNameTh}</p>
                <p className="text-xs text-muted-foreground">
                  บูธ {b.booths && b.booths.length > 0
                    ? b.booths.map((bb) => bb.boothCode).join(", ")
                    : b.boothCode}
                  {b.branch ? ` • ${b.branch}` : ""}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {b.startDate ? formatThaiDate(b.startDate.slice(0, 10)) : "-"}
                <br />
                {b.endDate ? `— ${formatThaiDate(b.endDate.slice(0, 10))}` : ""}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-primary">
                {formatTHB(b.grandTotal)}
              </td>
              <td className="px-4 py-3">
                <BookingStatusPill status={b.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/bookings/${b.code}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" /> ดู
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
