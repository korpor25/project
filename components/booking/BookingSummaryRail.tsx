"use client";

import { computePrice, eventDays, formatTHB } from "@/lib/pricing";
import { useBookingStore } from "@/stores/bookingStore";
import type { Booth, EventDetail } from "@/types/domain";

// Must match service.DefaultInstallmentPlan[0].Pct on the backend — the
// installment-1 share that "DEPOSIT" / "INSTALLMENT_1" customers pay now.
const FIRST_INSTALLMENT_PCT = 0.3;

export function BookingSummaryRail({
  event,
  booths,
}: {
  event: EventDetail;
  booths: Booth[];
}) {
  const installmentPlan = useBookingStore(
    (s) => s.draft.installmentPlan ?? "DEPOSIT",
  );
  const discount = useBookingStore((s) => s.draft.discount);
  const days = eventDays(event.startDate, event.endDate);
  // Every line in the breakdown scales linearly off rent, so summing the
  // per-day prices first gives the same result as adding up per-booth totals.
  const perDay = booths.reduce((sum, b) => sum + b.price, 0);
  const price = computePrice(perDay, days, discount);

  const dueNow =
    installmentPlan === "ALL"
      ? price.finalTotal
      : Math.round(price.finalTotal * FIRST_INSTALLMENT_PCT * 100) / 100;
  const remaining = Math.round((price.finalTotal - dueNow) * 100) / 100;

  return (
    <aside className="sticky top-6 space-y-4 self-start">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          บูธที่เลือก{booths.length > 1 ? ` (${booths.length})` : ""}
        </p>
        {booths.length > 1 ? (
          <ul className="mt-2 space-y-1">
            {booths.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold">บูธ {b.code}</span>
                <span className="text-muted-foreground">
                  {formatTHB(b.price * days)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-lg font-bold">บูธ {booths[0]?.code}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{event.nameTh}</p>

        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <Row label="ห้าง" value={event.branch} />
          <Row label="ชั้น" value={event.floor} />
          <Row label="ระยะเวลา" value={`${days} วัน`} />
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="font-semibold">สรุปค่าใช้จ่าย</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Row label="ค่าเช่าพื้นที่" value={formatTHB(price.rent)} />
          <Row label="VAT 7%" value={formatTHB(price.vat)} />
          {price.discountAmount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>ส่วนลด{discount?.type === "PERCENT" ? ` (${discount.value}%)` : ""}</span>
              <span className="font-medium">-{formatTHB(price.discountAmount)}</span>
            </div>
          )}
        </dl>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">รวมทั้งสิ้น</span>
          <div className="text-right">
            {price.discountAmount > 0 && (
              <p className="text-xs text-muted-foreground line-through">{formatTHB(price.grandTotal)}</p>
            )}
            <span className="text-xl font-bold text-primary">{formatTHB(price.finalTotal)}</span>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-primary-soft px-3 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            ที่ต้องชำระตอนนี้
          </p>
          <p className="mt-0.5 text-xl font-bold text-primary-hover">
            {formatTHB(dueNow)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {installmentPlan === "ALL"
              ? "ชำระเต็มจำนวน • ไม่มีงวดต่อ"
              : `งวดที่ 1 จาก 4 งวด • คงเหลืออีก ${formatTHB(remaining)}`}
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
 