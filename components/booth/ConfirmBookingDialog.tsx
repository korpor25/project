"use client";

import Image from "next/image";
import { ClipboardCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { CONTACT } from "@/lib/contact";
import { coverStyle } from "@/lib/eventCover";
import { eventDays, formatTHB } from "@/lib/pricing";
import type { Booth, EventDetail } from "@/types/domain";

export function ConfirmBookingDialog({
  open,
  onClose,
  onConfirm,
  event,
  booths,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: EventDetail;
  booths: Booth[];
}) {
  if (booths.length === 0) return null;
  const days = eventDays(event.startDate, event.endDate);
  const rent = booths.reduce((sum, b) => sum + b.price, 0) * days;
  const vat = Math.round(rent * 0.07 * 100) / 100;
  const total = rent + vat;
  const many = booths.length > 1;
  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {many ? `ยืนยันการจอง ${booths.length} บูธ` : "ยืนยันการจองบูธ"}
          </div>
        </DialogTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          ตรวจสอบรายละเอียดก่อนดำเนินการ
        </p>
      </DialogHeader>
      <DialogBody>
        <div className="flex gap-3 rounded-lg border border-border p-3">
          {/* Same cover the event uses everywhere else: the uploaded image when
              there is one, otherwise the per-category gradient. */}
          <div
            className="h-20 w-20 shrink-0 rounded-md bg-muted"
            style={coverStyle(event)}
            aria-hidden
          />
          <div className="flex-1 text-sm">
            <p className="font-semibold">{event.nameTh}</p>
            <p className="text-xs text-muted-foreground">{event.branch} • {event.floor}</p>
            <p className="mt-1 text-xs">
              บูธ {booths.map((b) => b.code).join(", ")}
            </p>
          </div>
        </div>

        {many && (
          <ul className="mt-4 space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
            {booths.map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  บูธ {b.code}
                  <span className="ml-1 text-xs">
                    ({formatTHB(b.price)}/วัน)
                  </span>
                </span>
                <span className="font-medium">
                  {formatTHB(b.price * days)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-4 space-y-1.5 text-sm">
          <Row
            label={many ? `ค่าเช่าพื้นที่ (${booths.length} บูธ)` : "ค่าเช่าพื้นที่"}
            value={formatTHB(rent)}
          />
          <Row label="VAT 7%" value={formatTHB(vat)} />
          <div className="border-t border-border pt-2">
            <Row label="รวมทั้งสิ้น" value={formatTHB(total)} highlight />
          </div>
        </dl>

        {/* Price is negotiable over LINE, and this dialog is the last screen
            before the booth gets locked — the one moment that offer is worth
            making. It sits above the lock warning on purpose: the warning is
            what pushes people to hesitate, and this is the answer to it. */}
        <section className="mt-4 rounded-lg border border-success/30 bg-success-soft p-3">
          <div className="flex items-start gap-3">
            {/* Useful on a desktop, where the phone that scans it is a
                separate device. On a phone the button below is the way in,
                so the code shrinks rather than taking half the dialog. */}
            <Image
              src="/qr.jpg"
              alt="QR code สำหรับเพิ่มเพื่อน LINE พี่อ้อย"
              width={900}
              height={900}
              className="h-20 w-20 shrink-0 rounded-md border border-border bg-white object-contain p-0.5 sm:h-24 sm:w-24"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">
                เพื่อให้ได้ข้อเสนอที่ดีที่สุดสำหรับลูกค้า ทัก LINE มาหาเรานะคะ
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                สแกน QR หรือกดปุ่มด้านล่าง คุยกับพี่อ้อยเรื่องราคาได้ก่อนยืนยัน
              </p>
              <a
                href={CONTACT.line.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-md bg-success px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
              >
                <MessageCircle className="h-4 w-4" />
                เพิ่มเพื่อน LINE พี่อ้อย
              </a>
            </div>
          </div>
        </section>

        <p className="mt-4 rounded-md bg-warning-soft p-3 text-xs text-foreground/80">
          ⚠️ เมื่อยืนยันแล้ว ระบบจะล็อก
          {many ? `ทั้ง ${booths.length} บูธ` : "บูธ"}
          ให้คุณ 5 นาทีเพื่อกรอกข้อมูล หากไม่กรอกในเวลาที่กำหนดบูธจะถูกปลดอัตโนมัติ
        </p>
      </DialogBody>
      {/* The quiet "ติดต่อสอบถาม" link that used to sit here said the same
          thing as the LINE panel above, only weaker — one route to LINE, not
          two competing ones. */}
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>แก้ไขข้อมูล</Button>
        <Button onClick={onConfirm}>ยืนยันการจอง</Button>
      </DialogFooter>
    </Dialog>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={highlight ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={highlight ? "text-lg font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
 