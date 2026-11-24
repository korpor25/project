"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  approvePayment,
  fetchBookingPaymentsClient,
  rejectPayment,
  type Payment,
  type PaymentStatus,
} from "@/lib/api/payments";
import { formatThaiDate, formatTHB } from "@/lib/pricing";

type Props = {
  bookingCode: string;
  initial: Payment[];
};

/**
 * Admin review panel for the 4-installment schedule. SUBMITTED rows get inline
 * approve/reject controls; rejected rows require the admin to leave a note so
 * the user knows what to fix when re-submitting.
 */
export function AdminPaymentReview({ bookingCode, initial }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Payment[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const fresh = await fetchBookingPaymentsClient(bookingCode);
      setRows(fresh);
      router.refresh();
    } catch {
      // keep stale rows visible on transient failure
    }
  }

  async function onApprove(p: Payment) {
    setError(null);
    setBusyId(p.id);
    try {
      await approvePayment(p.id);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(p: Payment) {
    if (!rejectNote.trim()) {
      setError("ต้องระบุเหตุผลที่ปฏิเสธ");
      return;
    }
    setError(null);
    setBusyId(p.id);
    try {
      await rejectPayment(p.id, rejectNote.trim());
      setRejectFor(null);
      setRejectNote("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <header className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">การชำระเงิน</h3>
        </header>
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          ไม่มีตารางการชำระเงินสำหรับใบจองนี้
        </p>
      </div>
    );
  }

  const submitted = rows.filter((r) => r.status === "SUBMITTED").length;
  const approved = rows.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">การชำระเงิน</h3>
          <Badge tone="neutral">
            {approved}/{rows.length} อนุมัติแล้ว
          </Badge>
        </div>
        {submitted > 0 && (
          <Badge tone="info">{submitted} งวดรอตรวจสอบ</Badge>
        )}
      </header>

      {error && (
        <div className="mb-3 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      <ol className="space-y-3">
        {rows.map((p) => (
          <li
            key={p.id}
            className="grid gap-3 rounded-lg border border-border bg-background p-4 lg:grid-cols-[160px_1fr_auto] lg:items-start"
          >
            {/* Slip preview */}
            <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {p.signedUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.signedUrl}
                  alt={`สลิปงวด ${p.installmentNo}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="text-[11px] text-muted-foreground">ยังไม่มีสลิป</p>
              )}
            </div>

            {/* Meta */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {p.label ?? `งวดที่ ${p.installmentNo}`}
                </p>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatTHB(p.amount)}
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {p.dueDate && (
                  <p className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    ครบกำหนด {formatThaiDate(p.dueDate.slice(0, 10))}
                  </p>
                )}
                {p.submittedAt && (
                  <p>
                    อัปโหลดเมื่อ {p.submittedAt.replace("T", " ").slice(0, 16)}
                  </p>
                )}
                {p.notes && (
                  <p className="text-danger">หมายเหตุที่เคยปฏิเสธ: {p.notes}</p>
                )}
              </div>
              {p.signedUrl && (
                <a
                  href={p.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  เปิดสลิปขนาดเต็ม
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 lg:items-end">
              {p.status === "SUBMITTED" && rejectFor !== p.id && (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onApprove(p)}
                    disabled={busyId === p.id}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    อนุมัติงวดนี้
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRejectFor(p.id);
                      setRejectNote("");
                    }}
                    disabled={busyId === p.id}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    ปฏิเสธ
                  </Button>
                </>
              )}
              {rejectFor === p.id && (
                <div className="w-full space-y-2 lg:w-64">
                  <Textarea
                    rows={3}
                    placeholder="ระบุเหตุผล เช่น ยอดไม่ตรง, สลิปไม่ชัด..."
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectFor(null);
                        setRejectNote("");
                      }}
                      disabled={busyId === p.id}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onReject(p)}
                      disabled={busyId === p.id || !rejectNote.trim()}
                    >
                      ยืนยันปฏิเสธ
                    </Button>
                  </div>
                </div>
              )}
              {p.status === "APPROVED" && (
                <p className="text-xs text-success">อนุมัติแล้ว</p>
              )}
              {p.status === "PENDING" && (
                <p className="text-xs text-muted-foreground">รอผู้เช่าอัปโหลด</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "APPROVED":
      return <Badge tone="success">อนุมัติแล้ว</Badge>;
    case "SUBMITTED":
      return <Badge tone="info">รอตรวจสอบ</Badge>;
    case "REJECTED":
      return <Badge tone="danger">ปฏิเสธ</Badge>;
    default:
      return <Badge tone="warning">รอชำระ</Badge>;
  }
}
