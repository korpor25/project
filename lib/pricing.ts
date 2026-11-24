import type { DiscountResult, PriceBreakdown } from "@/types/domain";

const DEPOSIT_PCT = 0.3;
const VAT_PCT = 0.07;

/** Number of days between two ISO date strings (inclusive). */
export function eventDays(startDate: string, endDate: string): number {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Compute the cost breakdown for a booking. Backend must re-compute this
 * server-side at the time of booking — this helper is for UI preview only.
 */
export function computePrice(boothPrice: number, days = 1, discount?: DiscountResult): PriceBreakdown {
  const rent = boothPrice * days;
  const serviceFee = 0;
  const deposit = round2(rent * DEPOSIT_PCT);
  const vatBase = rent;
  const vat = round2(vatBase * VAT_PCT);
  const grandTotal = round2(vatBase + vat);
  const discountAmount = discount
    ? discount.type === "PERCENT"
      ? round2(grandTotal * (discount.value / 100))
      : round2(discount.value)
    : 0;
  const finalTotal = round2(grandTotal - discountAmount);
  return { rent, serviceFee, deposit, vatBase, vat, grandTotal, discountAmount, finalTotal };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatTHB(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatThaiDate(iso: string, pattern: "short" | "long" = "short"): string {
  const d = new Date(iso);
  const month = pattern === "long"
    ? d.toLocaleDateString("th-TH", { month: "long" })
    : d.toLocaleDateString("th-TH", { month: "short" });
  const year = d.getFullYear() + 543;
  return `${d.getDate()} ${month} ${year}`;
}

/**
 * Compact Thai date range that drops whatever the two ends share:
 *   same month -> "15 – 20 ส.ค. 2569"
 *   same year  -> "28 ส.ค. – 3 ก.ย. 2569"
 *   otherwise  -> "28 ธ.ค. 2569 – 3 ม.ค. 2570"
 *
 * Reads the parts in UTC on purpose. Inputs are bare "yyyy-mm-dd" that Date
 * parses as UTC midnight, so local getters would render the previous day on
 * any host west of Greenwich.
 */
export function formatThaiDateRange(
  startIso: string,
  endIso: string,
  pattern: "short" | "long" = "short",
): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const month = (d: Date) =>
    d.toLocaleDateString("th-TH", {
      month: pattern === "long" ? "long" : "short",
      timeZone: "UTC",
    });
  const day = (d: Date) => d.getUTCDate();
  const beYear = (d: Date) => d.getUTCFullYear() + 543;

  if (beYear(s) !== beYear(e)) {
    return `${day(s)} ${month(s)} ${beYear(s)} – ${day(e)} ${month(e)} ${beYear(e)}`;
  }
  if (s.getUTCMonth() !== e.getUTCMonth()) {
    return `${day(s)} ${month(s)} – ${day(e)} ${month(e)} ${beYear(e)}`;
  }
  if (day(s) === day(e)) return `${day(e)} ${month(e)} ${beYear(e)}`;
  return `${day(s)} – ${day(e)} ${month(e)} ${beYear(e)}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Bangkok calendar day as a day number, for date-to-date comparison. */
function bangkokDayNumber(ms: number): number {
  return Math.floor((ms + BANGKOK_OFFSET_MS) / MS_PER_DAY);
}

/**
 * Days an event still runs, counting today. The final day returns 1, and only
 * a date that has already passed returns 0.
 *
 * Comparing calendar days rather than instants matters here: `endDate` is a
 * bare "yyyy-mm-dd" that Date parses as UTC midnight, so subtracting Date.now()
 * directly reports an event as finished from 07:00 Bangkok time on its own
 * closing day.
 */
export function daysRemaining(endIso: string, now: number = Date.now()): number {
  const diff = bangkokDayNumber(new Date(endIso).getTime()) - bangkokDayNumber(now);
  return Math.max(0, diff + 1);
}
  
  