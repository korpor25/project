"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Receipt, Upload, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Payment, PaymentStatus } from "@/lib/api/payments";
import { fetchBookingPaymentsClient } from "@/lib/api/payments";
import { formatThaiDate, formatTHB } from "@/lib/pricing";
import { uploadInstallmentSlip } from "@/lib/storage/upload";

type Props = {
  userId: string;
  bookingCode: string;
  initial: Payment[];
};

const MAX_SLIP_MB = 10;
const ACCEPT = "image/png,image/jpeg";

/**
 * 4-installment schedule for the user-facing booking page. Each row lets the
 * user upload (or replace) the slip for one installment; refresh re-reads from
 * the backend so signed URLs and statuses stay current.
 */
export function PaymentSchedule({ userId, bookingCode, initial }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Payment[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(p: Payment, file: File) {
    setError(null);
    if (file.size > MAX_SLIP_MB * 1024 * 1024) {
      setError(`สลิปต้องไม่เกิน ${MAX_SLIP_MB} MB`);
      return;
    }
    setBusyId(p.id);
    try {
      await uploadInstallmentSlip(userId, bookingCode, p.installmentNo, p.id, file);
      const fresh = await fetchBookingPaymentsClient(bookingCode);
      setRows(fresh);
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "เกิดข้อผิดพลาด");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Receipt className="h-4 w-4 text-primary" />
          ตารางการชำระเงิน
        </h3>
        <p className="mt-3 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          ยังไม่มีตารางการชำระสำหรับการจองนี้
        </p>
      </div>
    );
  }

  const totalDue = rows.reduce((s, r) => s + r.amount, 0);
  const paid = rows
    .filter((r) => r.status === "APPROVED")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Receipt className="h-4 w-4 text-primary" />
          ตารางการชำระเงิน ({rows.length} งวด)
        </h3>
        <div className="text-right text-xs text-muted-foreground">
          <p>
            ชำระแล้ว{" "}
            <span className="font-semibold text-success">{formatTHB(paid)}</span>{" "}
            / {formatTHB(totalDue)}
          </p>
        </div>
      </header>

      {error && (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {rows.map((p) => (
          <li
            key={p.id}
            className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
          >
            <div>
              <p className="text-sm font-semibold">
                {p.label ?? `งวดที่ ${p.installmentNo}`}
              </p>
              {p.dueDate && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  ครบกำหนด {formatThaiDate(p.dueDate.slice(0, 10))}
                </p>
              )}
              {p.notes && (
                <p className="mt-1 text-xs text-danger">หมายเหตุ: {p.notes}</p>
              )}
            </div>

            <div className="text-right">
              <p className="text-base font-bold text-primary">
                {formatTHB(p.amount)}
              </p>
              <StatusBadge status={p.status} />
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              {p.signedUrl && (
                <a
                  href={p.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted"
                >
                  ดูสลิป
                </a>
              )}
              {p.status !== "APPROVED" && (
                <UploadButton
                  busy={busyId === p.id}
                  hasSlip={Boolean(p.signedUrl)}
                  onPick={(f) => onUpload(p, f)}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function UploadButton({
  busy,
  hasSlip,
  onPick,
}: {
  busy: boolean;
  hasSlip: boolean;
  onPick: (f: File) => void;
}) {
  const base =
    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const filled = hasSlip
    ? "border border-border bg-card hover:bg-muted"
    : "bg-primary text-primary-foreground hover:bg-primary-hover";
  return (
    <label className={`${base} ${filled} ${busy ? "opacity-50" : ""}`}>
      <Upload className="h-3.5 w-3.5" />
      {busy ? "กำลังอัปโหลด..." : hasSlip ? "อัปโหลดใหม่" : "อัปโหลดสลิป"}
      <input
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge tone="success" className="mt-1 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          อนุมัติแล้ว
        </Badge>
      );
    case "SUBMITTED":
      return <Badge tone="info" className="mt-1">รอตรวจสอบ</Badge>;
    case "REJECTED":
      return (
        <Badge tone="danger" className="mt-1 gap-1">
          <XCircle className="h-3 w-3" />
          ปฏิเสธ
        </Badge>
      );
    default:
      return <Badge tone="warning" className="mt-1">รอชำระ</Badge>;
  }
}
