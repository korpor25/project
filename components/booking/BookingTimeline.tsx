import { Check, Clock, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/domain";

type Step = { key: BookingStatus; label: string; icon: React.ElementType };

const STEPS: Step[] = [
  { key: "PENDING",   label: "ส่งคำขอ",      icon: Check },
  { key: "REVIEWING", label: "กำลังตรวจสอบ", icon: Search },
  { key: "APPROVED",  label: "รับการยืนยัน", icon: Check },
];

const ORDER: Record<BookingStatus, number> = {
  PENDING: 0,
  REVIEWING: 1,
  APPROVED: 2,
  REJECTED: 1,
  CANCELLED: 0,
  EXPIRED: 0,
};

export function BookingTimeline({ status }: { status: BookingStatus }) {
  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-4">
        <div className="flex items-center gap-2 text-danger">
          <X className="h-5 w-5" />
          <p className="font-semibold">ถูกปฏิเสธ</p>
        </div>
        <p className="mt-1 text-sm">Admin ปฏิเสธคำขอจอง กรุณาตรวจสอบอีเมลเพื่อดูเหตุผลและติดต่อทีมงาน</p>
      </div>
    );
  }

  const current = ORDER[status];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-sm font-semibold">สถานะการดำเนินการ</p>
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const done = i < current || status === "APPROVED";
          const active = i === current && status !== "APPROVED";
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2",
                    done && "border-success bg-success text-white",
                    active && "border-primary bg-primary-soft text-primary-hover",
                    !done && !active && "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-5 w-5" /> : active ? <Clock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <p className={cn("mt-2 text-xs", done || active ? "font-semibold" : "text-muted-foreground")}>
                  {s.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    done ? "bg-success/50" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
