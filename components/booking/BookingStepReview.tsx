"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBookingStore } from "@/stores/bookingStore";
import { computePrice, eventDays, formatTHB, formatThaiDate } from "@/lib/pricing";
import { createBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/error";
import { createClient } from "@/lib/supabase/client";
import {
  uploadBookingDocs,
  uploadPaymentSlip,
} from "@/lib/storage/upload";
import type { Booth, EventDetail } from "@/types/domain";

export function BookingStepReview({
  event,
  booths: initialBooths,
  onBack,
}: {
  event: EventDetail;
  booths: Booth[];
  onBack: () => void;
}) {
  const router = useRouter();
  const { draft, reset } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Booths may shrink if a 409 tells us some were taken; track as state so UI
  // can re-render with the remaining selectable booths.
  const [booths, setBooths] = useState<Booth[]>(initialBooths);

  const days = eventDays(event.startDate, event.endDate);
  const perDay = booths.reduce((sum, b) => sum + b.price, 0);
  const price = computePrice(perDay, days, draft.discount);

  const handleSubmit = async () => {
    if (booths.length === 0) return;
    setSubmitting(true);
    setError(null);
    setProgress("กำลังส่งคำขอจอง...");
    try {
      const booking = await createBooking({
        boothIds: booths.map((b) => b.id),
        weeks: days,
        fullName: draft.fullName ?? "",
        companyName: draft.companyName,
        phone: draft.phone ?? "",
        email: draft.email ?? "",
        taxId: draft.taxId,
        productCategory: draft.productCategory,
        productDetail: draft.productDetail,
        installmentPlan: draft.installmentPlan ?? "DEPOSIT",
        discountCode: draft.discount?.code,
        acceptTerms: true,
      });

      // Look up the authenticated user id — storage paths are partitioned per
      // user so each customer can only access their own files.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (userId) {
        if (draft.idCard?.length) {
          setProgress("กำลังอัปโหลดบัตรประชาชน...");
          await uploadBookingDocs(userId, booking.code, "ID_CARD", draft.idCard);
        }
        if (draft.companyDoc?.length) {
          setProgress("กำลังอัปโหลดเอกสารบริษัท...");
          await uploadBookingDocs(userId, booking.code, "COMPANY_CERT", draft.companyDoc);
        }
        if (draft.productImages?.length) {
          setProgress("กำลังอัปโหลดรูปสินค้า...");
          await uploadBookingDocs(userId, booking.code, "PRODUCT_IMAGE", draft.productImages);
        }
        if (draft.slip?.length) {
          setProgress("กำลังอัปโหลดสลิป...");
          await uploadPaymentSlip(userId, booking.code, draft.slip[0]);
        }
      }

      reset();
      router.push(`/bookings/${booking.code}`);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          router.push(
            `/login?next=${encodeURIComponent(`/events/${event.slug}/book?booth=${booths.map((b) => b.code).join(",")}`)}`,
          );
          return;
        }

        // 409 BOOTH_NOT_AVAILABLE — some booths were taken during submit.
        // Remove the taken booths from the local selection so the user can
        // retry with whatever is still available.
        if (e.status === 409 && e.code === "BOOTH_NOT_AVAILABLE") {
          const unavailableIds = (
            (e.details?.unavailableBoothIds as string[] | undefined) ?? []
          );
          const unavailableCodes = booths
            .filter((b) => unavailableIds.includes(b.id))
            .map((b) => b.code);

          // Strip taken booths so the retry payload won't include them.
          const remaining = booths.filter((b) => !unavailableIds.includes(b.id));
          setBooths(remaining);

          const codeList = unavailableCodes.length > 0
            ? unavailableCodes.join(", ")
            : unavailableIds.join(", ");

          setError(
            `บูธ ${codeList} ถูกจองโดยผู้อื่นไปแล้ว — ถูกนำออกจากรายการแล้ว` +
            (remaining.length > 0
              ? " กดยืนยันอีกครั้งเพื่อจองบูธที่เหลือ"
              : " ไม่มีบูธเหลือ กรุณากลับไปเลือกบูธใหม่"),
          );
          setSubmitting(false);
          setProgress(null);
          return;
        }

        const details = e.details
          ? Object.values(e.details).join(", ")
          : "";
        setError(details ? `${e.message} (${details})` : e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("ส่งคำขอจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
      setSubmitting(false);
      setProgress(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-hover">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold">ตรวจสอบและยืนยัน</h2>
          <p className="text-xs text-muted-foreground">
            ตรวจสอบข้อมูลให้ถูกต้องก่อนส่งให้ Admin พิจารณา
          </p>
        </div>
      </header>

      <Section title="อีเวนต์และบูธ">
        <Row label="อีเวนต์" value={event.nameTh} />
        <Row label="สถานที่" value={`${event.branch} • ${event.floor}`} />
        <Row label="วันที่จัดงาน" value={`${formatThaiDate(event.startDate, "long")} – ${formatThaiDate(event.endDate, "long")}`} />
        <Row
          label={booths.length > 1 ? `บูธ (${booths.length})` : "บูธ"}
          value={booths.map((b) => b.code).join(", ")}
        />
      </Section>

      <Section title="ข้อมูลผู้จอง">
        <Row label="ชื่อ-นามสกุล" value={draft.fullName ?? "-"} />
        <Row label="บริษัท/ร้านค้า" value={draft.companyName ?? "-"} />
        <Row label="เบอร์โทรศัพท์" value={draft.phone ?? "-"} />
        <Row label="อีเมล" value={draft.email ?? "-"} />
        <Row label="เลขผู้เสียภาษี" value={draft.taxId ?? "-"} />
        <Row label="ประเภทสินค้า" value={draft.productCategory ?? "-"} />
      </Section>

      <Section title="การชำระเงิน">
        <Row label="รูปแบบ" value={installmentLabel(draft.installmentPlan)} />
        <Row label="วิธีการชำระ" value={draft.paymentMethod === "PROMPTPAY" ? "PromptPay / QR" : "โอนผ่านธนาคาร"} />
        <Row label="สลิป" value={draft.slip?.[0]?.name ?? "ยังไม่ได้แนบ"} />
      </Section>

      <Section title="สรุปค่าใช้จ่าย">
        {booths.length > 1 &&
          booths.map((b) => (
            <Row
              key={b.id}
              label={`บูธ ${b.code} (${formatTHB(b.price)}/วัน × ${days} วัน)`}
              value={formatTHB(b.price * days)}
            />
          ))}
        <Row
          label={booths.length > 1 ? "ค่าเช่าพื้นที่รวม" : "ค่าเช่าพื้นที่"}
          value={formatTHB(price.rent)}
        />
        <Row label="VAT 7%" value={formatTHB(price.vat)} />
        {price.discountAmount > 0 && (
          <Row
            label={`ส่วนลด${draft.discount?.type === "PERCENT" ? ` (${draft.discount.value}%)` : ""}${draft.discount?.code ? ` • ${draft.discount.code}` : ""}`}
            value={`-${formatTHB(price.discountAmount)}`}
          />
        )}
        <div className="pt-2">
          <Row label="รวมทั้งสิ้น" value={formatTHB(price.finalTotal)} highlight />
        </div>
      </Section>

      <p className="mt-6 rounded-md bg-warning-soft p-3 text-xs">
        ⚠️ การกดยืนยันการจองถือว่าคุณยอมรับเงื่อนไขการเช่าและนโยบายการยกเลิก
        Admin จะพิจารณาภายใน 24 ชม. และส่งอีเมลแจ้งผลให้ทราบ
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          ย้อนกลับ
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={submitting || booths.length === 0}
        >
          {submitting ? progress ?? "กำลังส่ง..." : "ยืนยันการจอง"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-lg font-bold text-primary" : "font-medium text-right"}>
        {value}
      </span>
    </div>
  );
}

function installmentLabel(p: string | undefined) {
  switch (p) {
    case "ALL": return "ชำระเต็มจำนวน";
    case "INSTALLMENT_1": return "ชำระงวดที่ 1";
    case "DEPOSIT":
    default: return "ชำระมัดจำ (30%)";
  }
}
