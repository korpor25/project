import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, FileText, Image as ImageIcon } from "lucide-react";
import { BookingTimeline } from "@/components/booking/BookingTimeline";
import { PaymentSchedule } from "@/components/booking/PaymentSchedule";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  fetchBookingAttachments,
  fetchBookingByCode,
} from "@/lib/api/bookings-server";
import { CONTACT } from "@/lib/contact";
import { ApiError } from "@/lib/api/error";
import { fetchBookingPayments } from "@/lib/api/payments-server";
import { formatThaiDate, formatTHB } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let booking;
  try {
    booking = await fetchBookingByCode(code);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        redirect(`/login?next=/bookings/${code}`);
      }
      if (e.status === 404) {
        notFound();
      }
      if (e.status === 403) {
        notFound();
      }
    }
    throw e;
  }
  if (!booking) notFound();

  // Attachments are best-effort: if the user has none yet (or storage is
  // misconfigured) we just render an empty state instead of failing the page.
  let attachments: Awaited<ReturnType<typeof fetchBookingAttachments>> = {
    documents: [],
    payments: [],
  };
  try {
    attachments = await fetchBookingAttachments(code);
  } catch {
    // ignore
  }

  let payments: Awaited<ReturnType<typeof fetchBookingPayments>> = [];
  try {
    payments = await fetchBookingPayments(code);
  } catch {
    // ignore — schedule may not exist for older bookings
  }

  const days =
    booking.startDate && booking.endDate
      ? Math.round(
          (new Date(booking.endDate).getTime() -
            new Date(booking.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  const displayTotal = Math.round((booking.totalRent + Math.round(booking.totalRent * 0.07 * 100) / 100) * 100) / 100;

  return (
    <>
      <section className="bg-gradient-to-br from-[#3a2916] via-[#5a4326] to-[#3a2916] py-14 text-white">
        <Container className="text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/90">
            <Clock className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] opacity-70">BOOKING SUBMITTED</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {statusTitle(booking.status)}
          </h1>
          <p className="mt-2 text-sm opacity-80">
            ระบบ CS Exhibition กำลังประมวลผลข้อมูลของคุณภายใน 24 ชั่วโมง
          </p>
          <div className="mt-4">
            <Badge tone="primary" className="rounded-full bg-white/10 px-4 py-1 text-base text-white">
              {booking.code}
            </Badge>
          </div>
        </Container>
      </section>

      <Container className="space-y-6 py-10">
        <BookingTimeline status={booking.status} />

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">รายละเอียดการจอง</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Cell
              label={booking.booths && booking.booths.length > 1 ? `บูธที่จอง (${booking.booths.length})` : "บูธที่จอง"}
              value={
                booking.booths && booking.booths.length > 0
                  ? `${booking.booths.map((bb) => bb.boothCode).join(", ")} • ${booking.eventNameTh}`
                  : `${booking.boothCode} • ${booking.eventNameTh}`
              }
            />
            <Cell label="ผู้จอง" value={`${booking.fullName} (${booking.email})`} />
            <Cell
              label="ขนาด"
              value={`${booking.widthM}×${booking.lengthM} ตร.ม. • ${(booking.widthM * booking.lengthM).toFixed(1)} ตร.ม.`}
            />
            <Cell
              label="ระยะเวลา"
              value={
                booking.startDate && booking.endDate
                  ? `${formatThaiDate(booking.startDate.slice(0, 10))} – ${formatThaiDate(booking.endDate.slice(0, 10))} (${days} วัน)`
                  : "—"
              }
            />
            <Cell
              label="ที่ตั้ง"
              value={`${booking.branch ?? "—"} • ${booking.floor ?? ""}`.trim()}
            />
            <Cell label="ยอดรวม" value={formatTHB(displayTotal)} highlight />
          </dl>
        </div>

        <PaymentSchedule
          userId={booking.userId}
          bookingCode={booking.code}
          initial={payments}
        />

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            เอกสารที่อัปโหลด ({attachments.documents.length})
          </h3>
          {attachments.documents.length === 0 ? (
            <p className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              ยังไม่ได้อัปโหลดเอกสาร
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {attachments.documents.map((d) => (
                <li
                  key={d.id}
                  className="overflow-hidden rounded-lg border border-border"
                >
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
                      className="flex aspect-square items-center justify-center bg-muted/30"
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </a>
                  )}
                  <p className="border-t border-border bg-muted/30 px-2 py-1.5 text-center text-[11px] font-medium">
                    {docTypeLabel(d.docType)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {booking.rejectionReason && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm">
            <p className="font-semibold text-danger">เหตุผลการปฏิเสธ</p>
            <p className="mt-1 text-foreground/80">{booking.rejectionReason}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline" size="lg">กลับไปหน้าหลัก</Button>
          </Link>
          <Link href="/bookings">
            <Button size="lg">ดูประวัติการจองของฉัน</Button>
          </Link>
        </div>

        <div className="rounded-xl border border-info/30 bg-info-soft p-4 text-sm">
          <p className="font-semibold text-info">ขั้นตอนถัดไป</p>
          <p className="mt-1 text-foreground/80">
            ทีมงานจะตรวจสอบสลิปและเอกสารแล้วแจ้งผลผ่านอีเมลและในระบบนี้
            หากมีข้อสงสัยติดต่อ{" "}
            <a href={CONTACT.mobile.href} className="font-medium hover:text-primary">
              {CONTACT.mobile.display}
            </a>{" "}
            หรือ Line{" "}
            <a
              href={CONTACT.line.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary"
            >
              {CONTACT.line.display}
            </a>
          </p>
        </div>
      </Container>
    </>
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
      return "เอกสาร";
  }
}

function statusTitle(s: string) {
  switch (s) {
    case "PENDING": return "รอการอนุมัติ";
    case "REVIEWING": return "กำลังตรวจสอบ";
    case "APPROVED": return "ยืนยันการจองสำเร็จ";
    case "REJECTED": return "ผลการพิจารณา";
    default: return "สถานะการจอง";
  }
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 ${highlight ? "text-lg font-bold text-primary" : "text-sm font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
 