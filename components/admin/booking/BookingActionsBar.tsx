"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, MessageSquare, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { approveBooking, rejectBooking } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import type { ApiBooking } from "@/lib/api/bookings";
import { ApproveDialog, RejectDialog } from "./ApproveRejectDialogs";

export function BookingActionsBar({ booking }: { booking: ApiBooking }) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const canDecide = booking.status === "PENDING" || booking.status === "REVIEWING";

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    try {
      await approveBooking(booking.code);
      showToast(`อนุมัติ ${booking.code} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "อนุมัติไม่สำเร็จ");
    } finally {
      setAction(null);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectBooking(booking.code, reason);
      showToast(`ปฏิเสธ ${booking.code} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "ปฏิเสธไม่สำเร็จ");
    } finally {
      setAction(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline">
          <Printer className="h-4 w-4" />
          พิมพ์
        </Button>
        <Button variant="outline">
          <MessageSquare className="h-4 w-4" />
          ส่งข้อความ
        </Button>
        {canDecide && (
          <>
            <Button variant="danger" onClick={() => setAction("reject")}>
              <X className="h-4 w-4" />
              ปฏิเสธ
            </Button>
            <Button variant="success" onClick={() => setAction("approve")}>
              <Check className="h-4 w-4" />
              อนุมัติการจอง
            </Button>
          </>
        )}
      </div>

      <ApproveDialog
        open={action === "approve"}
        booking={booking}
        onClose={() => setAction(null)}
        onConfirm={handleApprove}
      />
      <RejectDialog
        open={action === "reject"}
        booking={booking}
        onClose={() => setAction(null)}
        onConfirm={handleReject}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
