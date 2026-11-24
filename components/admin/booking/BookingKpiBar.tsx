import { CalendarX, CheckCircle2, ClipboardList, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiBooking } from "@/lib/api/bookings";

export type BookingKpiStats = {
  total: number;
  pending: number;
  approved: number;
  cancelled: number;
  expired: number;
};

export function computeKpis(bookings: ApiBooking[]): BookingKpiStats {
  return {
    total: bookings.length,
    pending: bookings.filter(
      (b) => b.status === "PENDING" || b.status === "REVIEWING",
    ).length,
    approved: bookings.filter((b) => b.status === "APPROVED").length,
    cancelled: bookings.filter(
      (b) => b.status === "REJECTED" || b.status === "CANCELLED",
    ).length,
    expired: bookings.filter((b) => b.status === "EXPIRED").length,
  };
}

export function BookingKpiBar({ stats }: { stats: BookingKpiStats }) {
  const items = [
    { label: "รายการทั้งหมด", value: stats.total,     icon: ClipboardList, color: "text-info bg-info-soft" },
    { label: "รออนุมัติ",     value: stats.pending,   icon: Clock,         color: "text-warning bg-warning-soft" },
    { label: "อนุมัติแล้ว",    value: stats.approved,  icon: CheckCircle2,  color: "text-success bg-success-soft" },
    { label: "ปฏิเสธ/ยกเลิก",  value: stats.cancelled, icon: XCircle,       color: "text-danger bg-danger-soft" },
    { label: "หมดอายุ",       value: stats.expired,   icon: CalendarX,     color: "text-muted-foreground bg-muted" },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((k) => (
        <div key={k.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", k.color)}>
              <k.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold leading-tight">
                {k.value.toLocaleString("th-TH")}
              </p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
