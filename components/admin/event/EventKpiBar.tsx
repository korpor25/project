import { Ban, CalendarClock, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const KPIS = [
  { label: "งานทั้งหมด",   value: 24, sub: "ทั้งหมดในระบบ",          icon: CalendarDays,   tone: "text-info bg-info-soft" },
  { label: "กำลังเปิดจอง", value: 8,  sub: "33.3% ของทั้งหมด",       icon: CheckCircle2,    tone: "text-success bg-success-soft" },
  { label: "ใกล้เริ่มงาน",  value: 5,  sub: "ภายใน 30 วัน",            icon: CalendarClock,   tone: "text-warning bg-warning-soft" },
  { label: "ปิดรับจอง",   value: 7,  sub: "29.2% ของทั้งหมด",       icon: XCircle,         tone: "text-muted-foreground bg-muted" },
  { label: "ยกเลิก",      value: 4,  sub: "16.7% ของทั้งหมด",       icon: Ban,             tone: "text-danger bg-danger-soft" },
];

export function EventKpiBar() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((k) => (
        <div key={k.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", k.tone)}>
              <k.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold leading-tight">{k.value} งาน</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">{k.sub}</p>
        </div>
      ))}
    </section>
  );
}
