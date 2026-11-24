import { Badge } from "./Badge";

const BOOKING_TONE = {
  PENDING: "warning",
  REVIEWING: "info",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
} as const;

const BOOTH_TONE = {
  AVAILABLE: "success",
  LOCKED: "warning",
  // A booth that is taken is the one status staff scan a list for, so it reads
  // red like the customer-facing grid already does — grey buried it among the
  // hidden/suspended rows it has nothing in common with.
  RESERVED: "danger",
  SUSPENDED: "danger",
  HIDDEN: "neutral",
} as const;

const EVENT_TONE = {
  DRAFT: "neutral",
  UPCOMING: "info",
  OPEN: "success",
  CLOSED: "neutral",
  CANCELLED: "danger",
} as const;

type BookingStatus = keyof typeof BOOKING_TONE;
type BoothStatus = keyof typeof BOOTH_TONE;
type EventStatus = keyof typeof EVENT_TONE;

const BOOKING_LABEL: Record<BookingStatus, string> = {
  PENDING: "รอดำเนินการ",
  REVIEWING: "กำลังตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
  EXPIRED: "หมดอายุ",
};

const BOOTH_LABEL: Record<BoothStatus, string> = {
  AVAILABLE: "ว่าง",
  LOCKED: "กำลังเลือก",
  RESERVED: "จองแล้ว",
  SUSPENDED: "ระงับ",
  HIDDEN: "ซ่อน",
};

/** Booth status plus the one thing it cannot say: whether the money arrived. */
export function boothStatusLabel(status: BoothStatus, paid?: boolean): string {
  if (status === "RESERVED" && paid) return "ขายแล้ว";
  return BOOTH_LABEL[status];
}

const EVENT_LABEL: Record<EventStatus, string> = {
  DRAFT: "ร่าง",
  UPCOMING: "เร็วๆ นี้",
  OPEN: "เปิดรับจอง",
  CLOSED: "ปิดแล้ว",
  CANCELLED: "ยกเลิก",
};

export function BookingStatusPill({ status }: { status: BookingStatus }) {
  return <Badge tone={BOOKING_TONE[status]}>{BOOKING_LABEL[status]}</Badge>;
}

export function BoothStatusPill({
  status,
  paid,
}: {
  status: BoothStatus;
  paid?: boolean;
}) {
  return (
    <Badge
      tone={BOOTH_TONE[status]}
      className={status === "RESERVED" ? "font-semibold" : undefined}
    >
      {boothStatusLabel(status, paid)}
    </Badge>
  );
}

export function EventStatusPill({ status }: { status: EventStatus }) {
  return <Badge tone={EVENT_TONE[status]}>{EVENT_LABEL[status]}</Badge>;
}
