"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cancelBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/error";

export function CancelBookingButton({ code }: { code: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await cancelBooking(code);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "ยกเลิกไม่สำเร็จ กรุณาลองใหม่",
      );
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
        <XCircle className="h-4 w-4" />
        ยกเลิกการจอง
      </Button>
      <Dialog open={open} onClose={() => !submitting && setOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 text-danger">
              <XCircle className="h-5 w-5" />
              ยืนยันการยกเลิก
            </div>
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            การยกเลิกถาวรไม่สามารถกู้คืนได้ บูธจะกลับเป็นว่างทันที
          </p>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm">
            คุณแน่ใจหรือไม่ที่จะยกเลิกการจอง{" "}
            <span className="font-mono font-semibold">{code}</span>?
          </p>
          {error && (
            <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            ปิด
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
