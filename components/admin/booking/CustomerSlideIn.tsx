"use client";

import { useEffect, useState } from "react";
import { FileText, Mail, MessageCircle, Phone, Receipt } from "lucide-react";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { ApiError } from "@/lib/api/error";
import {
  fetchBookingAttachmentsClient,
  type ApiBooking,
  type BookingAttachments,
} from "@/lib/api/bookings";
import { formatTHB } from "@/lib/pricing";

export function CustomerSlideIn({ booking }: { booking: ApiBooking | null }) {
  // Re-fetch attachments whenever the admin selects a different booking. We
  // could push these down from the server but admins often jump between rows,
  // so a quick client-side fetch keeps the list page lean.
  const [attachments, setAttachments] = useState<BookingAttachments | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!booking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttachments(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchBookingAttachmentsClient(booking.code)
      .then((data) => {
        if (!cancelled) setAttachments(data);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setAttachments({ documents: [], payments: [] });
        } else {
          setAttachments(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking?.code]);

  if (!booking) {
    return (
      <aside className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
        เลือกการจองในตารางเพื่อดูข้อมูลลูกค้า
      </aside>
    );
  }

  const initial = booking.fullName.slice(0, 1).toUpperCase();
  const slip = attachments?.payments.find((p) => p.signedUrl);

  return (
    <aside className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-primary-soft/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            {initial}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{booking.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {booking.companyName ?? "ไม่ระบุบริษัท"}
            </p>
          </div>
          <BookingStatusPill status={booking.status} />
        </div>
      </div>

      <div className="space-y-4 p-4 text-sm">
        <section>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            ติดต่อ
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {booking.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {booking.phone}
            </li>
            {booking.productCategory && (
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                {booking.productCategory}
              </li>
            )}
          </ul>
        </section>

        <section>
          <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Receipt className="h-3 w-3" />
            สลิปการชำระ
          </p>
          {loading ? (
            <div className="aspect-video w-full animate-pulse rounded-md bg-muted/40" />
          ) : slip?.signedUrl ? (
            <a
              href={slip.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-md border border-border bg-muted/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slip.signedUrl}
                alt="payment slip"
                className="h-36 w-full object-contain"
              />
            </a>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              ยังไม่มีสลิป
            </p>
          )}
        </section>

        <section>
          <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3 w-3" />
            เอกสารแนบ ({attachments?.documents.length ?? 0})
          </p>
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-square animate-pulse rounded-md bg-muted/40" />
              ))}
            </div>
          ) : attachments && attachments.documents.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {attachments.documents.map((d) => (
                <li key={d.id} className="overflow-hidden rounded-md border border-border">
                  {d.signedUrl && d.mimeType?.startsWith("image/") ? (
                    <a href={d.signedUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.signedUrl}
                        alt={d.docType}
                        className="aspect-square w-full object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={d.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex aspect-square w-full items-center justify-center bg-muted/40 text-muted-foreground"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  <p className="border-t border-border bg-muted/30 px-1.5 py-1 text-center text-[9px]">
                    {docTypeShortLabel(d.docType)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              ยังไม่มีเอกสารแนบ
            </p>
          )}
        </section>

        <section className="border-t border-border pt-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            สรุปการจอง
          </p>
          <dl className="space-y-1.5 text-xs">
            <Row label="บูธ" value={`${booking.boothCode} • Zone ${booking.zoneName ?? "—"}`} />
            {booking.widthM && booking.lengthM ? (
              <Row label="ขนาด" value={`${booking.widthM}×${booking.lengthM} ตร.ม.`} />
            ) : null}
            <Row label="ค่าเช่า" value={formatTHB(booking.totalRent)} />
            <Row label="VAT 7%" value={formatTHB(Math.round(booking.totalRent * 0.07 * 100) / 100)} />
            <div className="border-t border-border pt-1.5">
              <Row label="รวมทั้งสิ้น" value={formatTHB(Math.round((booking.totalRent * 1.07) * 100) / 100)} highlight />
            </div>
          </dl>
        </section>

        {booking.rejectionReason && (
          <section className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs">
            <p className="font-semibold text-danger">เหตุผลการปฏิเสธ</p>
            <p className="mt-1 text-foreground/80">{booking.rejectionReason}</p>
          </section>
        )}
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={highlight ? "text-sm font-bold text-primary" : "font-medium"}
      >
        {value}
      </span>
    </div>
  );
}

function docTypeShortLabel(t: string): string {
  switch (t) {
    case "ID_CARD":
      return "บัตร";
    case "COMPANY_CERT":
      return "ทะเบียน";
    case "PRODUCT_IMAGE":
      return "สินค้า";
    default:
      return "อื่น";
  }
}
 