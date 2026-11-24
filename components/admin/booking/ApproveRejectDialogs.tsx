"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { formatTHB } from "@/lib/pricing";
import type { ApiBooking } from "@/lib/api/bookings";

export function ApproveDialog({
  open,
  booking,
  onClose,
  onConfirm,
}: {
  open: boolean;
  booking: ApiBooking | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  if (!booking) return null;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            ยืนยันการอนุมัติ
          </div>
        </DialogTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          ระบบจะส่งอีเมลแจ้งผู้เช่าและตั้งสถานะบูธเป็น RESERVED
        </p>
      </DialogHeader>
      <DialogBody>
        <dl className="space-y-1.5 text-sm">
          <Row label="เลขที่ใบจอง" value={booking.code} />
          <Row
            label="ผู้เช่า"
            value={`${booking.fullName}${booking.companyName ? ` (${booking.companyName})` : ""}`}
          />
          <Row
            label="บูธ"
            value={`${booking.boothCode} • Zone ${booking.zoneName ?? "—"}`}
          />
          <Row
            label="ช่วงเวลา"
            value={
              booking.startDate && booking.endDate
                ? `${booking.startDate.slice(0, 10)} – ${booking.endDate.slice(0, 10)}`
                : "—"
            }
          />
          <Row label="ยอดรวม" value={formatTHB(booking.grandTotal)} highlight />
        </dl>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={submitting}>ยกเลิก</Button>
        <Button
          variant="success"
          onClick={async () => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 350));
            setSubmitting(false);
            onConfirm();
          }}
          disabled={submitting}
        >
          {submitting ? "กำลังประมวลผล..." : "ยืนยันอนุมัติ"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export function RejectDialog({
  open,
  booking,
  onClose,
  onConfirm,
}: {
  open: boolean;
  booking: ApiBooking | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!booking) return null;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
            ปฏิเสธการจอง
          </div>
        </DialogTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          การปฏิเสธไม่สามารถยกเลิกได้ ผู้เช่าจะได้รับอีเมลแจ้งเหตุผลอัตโนมัติ
        </p>
      </DialogHeader>
      <DialogBody className="space-y-3">
        <p className="text-sm">
          ใบจอง <span className="font-mono font-semibold">{booking.code}</span> ของ{" "}
          <span className="font-medium">{booking.fullName}</span>
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="reason">เหตุผลในการปฏิเสธ *</Label>
          <Textarea
            id="reason"
            rows={3}
            placeholder="เช่น เอกสารไม่ครบ, สลิปไม่ตรงกับยอด, ประเภทสินค้าไม่ตรงตามข้อกำหนด..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">หมายเหตุภายใน (ไม่ส่งให้ผู้เช่า)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="โน้ตสำหรับทีม Admin"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <p className="rounded-md bg-danger-soft p-3 text-xs text-danger">
          ⚠️ การกดปฏิเสธจะทำให้บูธ {booking.boothCode} ปลดล็อกและกลับสู่สถานะว่างทันที
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={submitting}>ยกเลิก</Button>
        <Button
          variant="danger"
          disabled={!reason.trim() || submitting}
          onClick={async () => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 350));
            setSubmitting(false);
            onConfirm(reason);
            setReason("");
            setNotes("");
          }}
        >
          {submitting ? "กำลังประมวลผล..." : "ยืนยันปฏิเสธ"}
        </Button>
      </DialogFooter>
    </Dialog>
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
