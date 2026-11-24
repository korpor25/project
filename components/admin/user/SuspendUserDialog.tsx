"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import type { AdminUserRow } from "@/lib/api/admin";

/** Copy overrides let the same reason-capture dialog serve both suspending an
 *  active account and rejecting a signup — same shape, different words. */
type Copy = {
  title?: string;
  subtitle?: string;
  warning?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;
};

export function SuspendUserDialog({
  open,
  user,
  onClose,
  onConfirm,
  copy,
}: {
  open: boolean;
  user: AdminUserRow | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  copy?: Copy;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!user) return null;

  const displayName = user.fullName ?? user.email;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
            {copy?.title ?? "ระงับบัญชีผู้ใช้"}
          </div>
        </DialogTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {copy?.subtitle ??
            "ผู้ใช้จะไม่สามารถเข้าใช้งานระบบและจองบูธใหม่ได้จนกว่าจะเปิดคืน"}
        </p>
      </DialogHeader>
      <DialogBody className="space-y-3">
        <div className="rounded-md bg-warning-soft p-3 text-xs">
          {copy?.warning ??
            "⚠️ การจองที่อยู่ในสถานะ “อนุมัติแล้ว” ของผู้ใช้นี้จะยังคงอยู่ แต่ผู้ใช้จะไม่สามารถจองเพิ่มหรือล็อกอินเข้าระบบได้"}
        </div>
        <p className="text-sm">
          ผู้ใช้: <span className="font-semibold">{displayName}</span> ({user.email})
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="reason">{copy?.reasonLabel ?? "เหตุผลในการระงับ"} *</Label>
          <Textarea
            id="reason"
            rows={3}
            placeholder={
              copy?.reasonPlaceholder ?? "เช่น พฤติกรรมไม่เหมาะสม, ผิดข้อตกลง..."
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={submitting}>ยกเลิก</Button>
        <Button
          variant="danger"
          disabled={!reason.trim() || submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await onConfirm(reason);
              setReason("");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting
            ? "กำลังประมวลผล..."
            : (copy?.confirmLabel ?? "ยืนยันระงับบัญชี")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
