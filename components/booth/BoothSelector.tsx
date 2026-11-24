"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Check, Image as ImageIcon, Lock, Wifi, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmBookingDialog } from "./ConfirmBookingDialog";
import { useBoothRealtime } from "@/lib/realtime/useBoothRealtime";
import { useBookingStore } from "@/stores/bookingStore";
import { computePrice, eventDays, formatTHB } from "@/lib/pricing";
import type { Booth, BoothStatus, EventDetail } from "@/types/domain";

/**
 * HIDDEN / SUSPENDED — how an admin marks a booth taken when the deal happened
 * off-platform. No booking row exists for it, so it is not RESERVED.
 */
const isClosedStatus = (s: BoothStatus) => s === "HIDDEN" || s === "SUSPENDED";

/**
 * Everything a customer reads as "จองแล้ว". Different bookkeeping behind them,
 * same answer to "can I have this one". The counter and the cards share this
 * so the headline can never disagree with the grid under it.
 */
const isTaken = (b: Booth) => b.status === "RESERVED" || isClosedStatus(b.status);

export function BoothSelector({
  event,
  booths: initialBooths,
}: {
  event: EventDetail;
  booths: Booth[];
}) {
  const router = useRouter();
  const patch = useBookingStore((s) => s.patch);
  const reset = useBookingStore((s) => s.reset);

  // Selection is a list: a renter can take several booths in one pass. Order
  // follows the order they were picked, so the summary reads back as they went.
  const [selected, setSelected] = useState<Booth[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booths, setBooths] = useState<Booth[]>(
    [...initialBooths].sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    ),
  );
  const [pulse, setPulse] = useState(0);

  // Live updates: any UPDATE on public.booths for this event flows in via
  // Supabase Realtime and patches the local booth list.
  const handleRealtimeUpdate = useCallback(
    (u: { id: string; status: Booth["status"] }) => {
      setBooths((prev) =>
        prev.map((b) => (b.id === u.id ? { ...b, status: u.status } : b)),
      );
      // Someone else took a booth this user had picked — drop it from the
      // selection rather than letting them carry a dead booth into the wizard.
      if (u.status !== "AVAILABLE") {
        setSelected((prev) => prev.filter((b) => b.id !== u.id));
      }
      setPulse((n) => n + 1);
    },
    [],
  );
  useBoothRealtime(event.id, handleRealtimeUpdate);

  const days = eventDays(event.startDate, event.endDate);

  const toggle = (booth: Booth) => {
    setSelected((prev) =>
      prev.some((b) => b.id === booth.id)
        ? prev.filter((b) => b.id !== booth.id)
        : [...prev, booth],
    );
  };

  const totalPerDay = selected.reduce((sum, b) => sum + b.price, 0);
  const totalRent = computePrice(totalPerDay, days).rent;

  const handleConfirm = () => {
    if (selected.length === 0) return;
    const codes = selected.map((b) => b.code);
    reset();
    patch({
      eventId: event.id,
      boothCodes: codes,
      weeks: days,
      boothZone: selected[0].zone,
    });
    router.push(
      `/events/${event.slug}/book?booth=${encodeURIComponent(codes.join(","))}`,
    );
  };

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">แผนผังบูธ</h2>
          {/* Hidden on phones: the page header above already says the same
              thing, and two subtitles in a row just cost scroll. */}
          <p className="hidden text-xs text-muted-foreground sm:block">
            ดูแผนผังประกอบการเลือกบูธจากรายการด้านล่าง — เลือกได้หลายบูธในครั้งเดียว
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success"
          title={`Live updates: ${pulse}`}
        >
          <Wifi className="h-3 w-3" />
          อัปเดตแบบ Real-time
        </span>
      </header>

      <section className="mt-4">
        {event.floorPlanUrl ? (
          // Height cap, not width: a portrait plan at full width ran taller than
          // the screen and pushed the booth list out of reach. A fixed ceiling
          // keeps every event's plan the same comfortable size.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.floorPlanUrl}
            alt={`แผนผังของ ${event.nameTh}`}
            // shadow-sm is what separates the frame from the page: --border and
            // --muted sit a few shades apart, so on white the outline alone
            // disappeared.
            className="max-h-80 w-full rounded-2xl border border-border bg-muted object-contain shadow-sm sm:max-h-[28rem]"
          />
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p>ยังไม่มีแผนผังสำหรับอีเวนต์นี้</p>
          </div>
        )}
      </section>

      <section className="mt-6 md:mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">บูธทั้งหมด ({booths.length})</h2>
          <p className="text-xs text-muted-foreground">
            ว่าง {booths.filter((b) => b.status === "AVAILABLE").length} • จองแล้ว{" "}
            {booths.filter(isTaken).length}
          </p>
        </div>
        {booths.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-12 text-center text-sm text-muted-foreground">
            ยังไม่มีบูธสำหรับอีเวนต์นี้
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
            {booths.map((b) => (
              <BoothCard
                key={b.id}
                booth={b}
                days={days}
                selected={selected.some((s) => s.id === b.id)}
                onSelect={() => toggle(b)}
              />
            ))}
          </ul>
        )}
      </section>

      {selected.length > 0 && (
        <div className="sticky bottom-4 mt-6 rounded-2xl border border-border bg-card p-4 shadow-lg">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  เลือกไว้ {selected.length} บูธ
                </p>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-danger hover:underline"
                >
                  ล้างทั้งหมด
                </button>
              </div>

              <ul className="mt-2 flex flex-wrap gap-1.5">
                {selected.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => toggle(b)}
                      aria-label={`เอาบูธ ${b.code} ออกจากรายการ`}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-3 pr-2 text-sm font-medium text-primary-hover transition-colors hover:bg-primary/20"
                    >
                      {b.code}
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-xs text-muted-foreground">
                {formatTHB(totalPerDay)}/วัน × {days} วัน ={" "}
                <span className="font-semibold text-foreground">
                  {formatTHB(totalRent)}
                </span>
              </p>
            </div>

            <Button size="lg" onClick={() => setConfirmOpen(true)}>
              ดำเนินการจอง
            </Button>
          </div>
        </div>
      )}

      <ConfirmBookingDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        event={event}
        booths={selected}
      />
    </>
  );
}

function BoothCard({
  booth,
  days,
  selected,
  onSelect,
}: {
  booth: Booth;
  days: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const isAvailable = booth.status === "AVAILABLE";
  const isReserved = booth.status === "RESERVED";
  // Kept in the grid so it still lines up with the printed floor plan above.
  const isClosed = isClosedStatus(booth.status);
  const tone =
    booth.status === "AVAILABLE"
      ? "success"
      : booth.status === "LOCKED"
        ? "warning"
        : // Taken and not-for-sale both read red: the customer only needs to
          // know they cannot have it. Grey put "ปิด" in the same visual class
          // as the card's own muted footnotes and it disappeared.
          "danger";
  // "จองแล้ว" vs "ขายแล้ว" — same unavailable booth, different finality.
  const statusLabel =
    booth.status === "AVAILABLE"
      ? "ว่าง"
      : booth.status === "LOCKED"
        ? "กำลังเลือก"
        : booth.status === "RESERVED"
          ? booth.paid
            ? "ขายแล้ว"
            : "จองแล้ว"
          : "ปิด";

  const totalRent = booth.price * days;
  const sizeLabel =
    booth.widthM && booth.lengthM
      ? `${booth.widthM}×${booth.lengthM} ม.`
      : booth.areaSqm
        ? `${booth.areaSqm} ตร.ม.`
        : null;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        disabled={!isAvailable && !selected}
        className={`flex h-full w-full flex-col gap-2 rounded-xl border-2 p-3 text-left transition sm:gap-2.5 sm:p-4 ${
          selected
            ? "border-primary bg-primary-soft shadow-md"
            : isReserved
              ? "border-danger/40 bg-danger-soft/60 cursor-not-allowed"
              : isAvailable
                ? "border-border bg-card hover:border-primary/60 hover:shadow-sm"
                : // No opacity fade here: it was dimming the status label
                  // itself, which is the one thing on a closed card that has
                  // to stay readable.
                  "border-danger/25 bg-muted/50 cursor-not-allowed"
        }`}
      >
        {/* Header row: booth code + status badge */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <div className="flex items-start gap-2">
            {/* Checkbox affordance — the grid is multi-select, so each card has
                to read as a toggle rather than a radio. */}
            {isAvailable && (
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            )}
            <div>
            <p
              className={`text-base font-bold leading-none sm:text-lg ${
                isReserved
                  ? "text-danger/80"
                  : isClosed
                    ? // Dropping the fade made these as loud as the bookable
                      // cards; muting just the code keeps the ranking right.
                      "text-muted-foreground"
                    : ""
              }`}
            >
              บูธ {booth.code}
            </p>
            {sizeLabel && (
              <p className="mt-1 text-xs text-muted-foreground">{sizeLabel}</p>
            )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isReserved && <Lock className="h-3.5 w-3.5 text-danger/70" />}
            <Badge tone={tone}>{statusLabel}</Badge>
          </div>
        </div>

        {/* Price / tenant section */}
        {isReserved ? (
          (booth.tenantProductCategory || booth.tenantProductDetail) && (
            <div className="rounded-lg bg-danger/10 px-3 py-2.5 space-y-1">
              {booth.tenantProductCategory && (
                <p className="text-xs font-medium text-danger/70">
                  {booth.tenantProductCategory}
                </p>
              )}
              {booth.tenantProductDetail && (
                <p className="line-clamp-2 text-xs text-danger/60">
                  {booth.tenantProductDetail}
                </p>
              )}
            </div>
          )
        ) : isClosed ? (
          // Quoting a price on a booth nobody can buy invites the one question
          // the page cannot answer, so the slot says why instead. HIDDEN and
          // SUSPENDED are what this business marks an already-taken booth with
          // when the deal happened outside the system, so to a customer it is
          // the same message as a RESERVED one.
          <div className="mt-auto rounded-lg bg-danger/5 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <p className="text-[11px] font-medium text-danger/80 sm:text-xs">
              จองแล้ว
            </p>
          </div>
        ) : (
          <div className={`mt-auto rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 ${selected ? "bg-primary/10" : "bg-muted/50"}`}>
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              {formatTHB(booth.price)}/วัน × {days} วัน
            </p>
            <p className="mt-0.5 text-sm font-bold text-primary sm:text-base">
              {formatTHB(totalRent)}
            </p>
          </div>
        )}
      </button>
    </li>
  );
}
