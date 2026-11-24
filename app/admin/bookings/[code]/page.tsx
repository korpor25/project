import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  Building,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { BookingActionsBar } from "@/components/admin/booking/BookingActionsBar";
import { AdminPaymentReview } from "@/components/admin/booking/AdminPaymentReview";
import { Badge } from "@/components/ui/Badge";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import {
  fetchBookingAttachments,
  fetchBookingByCode,
} from "@/lib/api/bookings-server";
import { ApiError } from "@/lib/api/error";
import { fetchBookingPayments } from "@/lib/api/payments-server";
import { formatTHB, formatThaiDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let booking;
  try {
    booking = await fetchBookingByCode(code);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) {
      notFound();
    }
    throw e;
  }
  if (!booking) notFound();

  // Best-effort: attachments may not exist for older bookings.
  let attachments: Awaited<ReturnType<typeof fetchBookingAttachments>> = {
    documents: [],
    payments: [],
  };
  try {
    attachments = await fetchBookingAttachments(code);
  } catch {
    // ignore — UI will show empty state
  }
  let payments: Awaited<ReturnType<typeof fetchBookingPayments>> = [];
  try {
    payments = await fetchBookingPayments(code);
  } catch {
    // ignore — older bookings may not have a schedule yet
  }

  const days =
    booking.startDate && booking.endDate
      ? Math.round(
          (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;
  const weeks = Math.max(1, Math.ceil(days / 7));
  const initial = booking.fullName.split(" ")[0]?.[0] ?? "?";

  return (
    <>
      <AdminTopbar title={booking.code} subtitle={booking.eventNameTh} />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปการจองทั้งหมด
          </Link>
          <BookingActionsBar booking={booking} />
        </div>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-xl font-bold text-warning">
                {initial}
              </div>
              <div>
                <h2 className="text-xl font-bold">{booking.fullName}</h2>
                <p className="text-sm text-muted-foreground">
                  {booking.companyName ?? "ไม่ระบุบริษัท"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <BookingStatusPill status={booking.status} />
                  <Badge tone="neutral">เลขที่จอง: {booking.code}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ยอดรวม</p>
              <p className="text-3xl font-bold text-primary">
                {formatTHB(Math.round(booking.totalRent * 1.07 * 100) / 100)}
              </p>
              <p className="text-xs text-muted-foreground">
                จองเมื่อ {formatThaiDate(booking.createdAt.slice(0, 10))}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem icon={User} label="ผู้จอง" value={booking.fullName} />
            <DetailItem icon={Building} label="บริษัท" value={booking.companyName ?? "—"} />
            <DetailItem icon={AtSign} label="อีเมล" value={booking.email} />
            <DetailItem icon={Phone} label="โทรศัพท์" value={booking.phone} />
            <DetailItem
              icon={MapPin}
              label={booking.booths && booking.booths.length > 1 ? `บูธ (${booking.booths.length})` : "บูธ"}
              value={
                booking.booths && booking.booths.length > 0
                  ? booking.booths.map((bb) => bb.boothCode).join(", ")
                  : `${booking.boothCode} • Zone ${booking.zoneName ?? "—"}`
              }
            />
            <DetailItem
              icon={CalendarDays}
              label="ระยะเวลา"
              value={
                booking.startDate && booking.endDate
                  ? `${formatThaiDate(booking.startDate.slice(0, 10))} – ${formatThaiDate(booking.endDate.slice(0, 10))}`
                  : "—"
              }
              hint={days ? `${days} วัน (${weeks} สัปดาห์)` : undefined}
            />
            <DetailItem icon={ClipboardList} label="อีเวนต์" value={booking.eventNameTh} />
            <DetailItem icon={CheckCircle2} label="สถานะ" value={statusLabel(booking.status)} />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <header className="mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">รายละเอียดราคา</h3>
          </header>
          <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
            <PriceRow label="ค่าเช่าพื้นที่" value={formatTHB(booking.totalRent)} />
            <PriceRow label="VAT 7%" value={formatTHB(Math.round(booking.totalRent * 0.07 * 100) / 100)} muted />
            <div className="border-t border-border pt-3 sm:col-span-2">
              <PriceRow
                label="ยอดรวมที่ต้องชำระ"
                value={formatTHB(Math.round(booking.totalRent * 1.07 * 100) / 100)}
                highlight
              />
            </div>
          </dl>
        </section>

        <AdminPaymentReview bookingCode={booking.code} initial={payments} />

        {booking.rejectionReason && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-sm">
            <p className="font-semibold text-danger">เหตุผลการปฏิเสธ</p>
            <p className="mt-1 text-foreground/80">{booking.rejectionReason}</p>
          </div>
        )}

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <header className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">เอกสารแนบ</h3>
            <span className="text-xs text-muted-foreground">
              ({attachments.documents.length} ไฟล์)
            </span>
          </header>
          {attachments.documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              ยังไม่มีเอกสารแนบ
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.documents.map((d) => (
                <li
                  key={d.id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  {d.signedUrl && d.mimeType?.startsWith("image/") ? (
                    <a href={d.signedUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.signedUrl}
                        alt={d.docType}
                        className="aspect-video w-full object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={d.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex aspect-video w-full items-center justify-center bg-muted/40 text-muted-foreground"
                    >
                      <ImageIcon className="h-8 w-8" />
                    </a>
                  )}
                  <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs">
                    <p className="font-medium">{docTypeLabel(d.docType)}</p>
                    <p className="text-muted-foreground">
                      {d.uploadedAt.replace("T", " ").slice(0, 16)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted,
  highlight,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd
        className={
          highlight
            ? "text-lg font-bold text-primary"
            : muted
              ? "text-muted-foreground"
              : "font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function docTypeLabel(t: string): string {
  switch (t) {
    case "ID_CARD":
      return "บัตรประชาชน";
    case "COMPANY_CERT":
      return "ทะเบียนพาณิชย์";
    case "PRODUCT_IMAGE":
      return "รูปสินค้า";
    default:
      return "อื่น ๆ";
  }
}

function statusLabel(s: string): string {
  switch (s) {
    case "PENDING":
      return "รอดำเนินการ";
    case "REVIEWING":
      return "กำลังตรวจสอบ";
    case "APPROVED":
      return "อนุมัติแล้ว";
    case "REJECTED":
      return "ปฏิเสธ";
    case "CANCELLED":
      return "ยกเลิก";
    case "EXPIRED":
      return "หมดอายุ";
    default:
      return s;
  }
}
 