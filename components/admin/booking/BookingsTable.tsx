"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/error";
import {
  approveBooking as approveApi,
  rejectBooking as rejectApi,
} from "@/lib/api/admin";
import type { ApiBooking } from "@/lib/api/bookings";
import { formatTHB, formatThaiDate } from "@/lib/pricing";
import { ApproveDialog, RejectDialog } from "./ApproveRejectDialogs";
import { CustomerSlideIn } from "./CustomerSlideIn";

export function BookingsTableShell({ bookings }: { bookings: ApiBooking[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<ApiBooking | null>(bookings[0] ?? null);
  const [actioned, setActioned] = useState<{ kind: "approve" | "reject"; b: ApiBooking } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (status && b.status !== status) return false;
      if (
        q &&
        ![b.code, b.fullName, b.companyName ?? "", b.boothCode].some((f) =>
          f.toLowerCase().includes(q.toLowerCase()),
        )
      )
        return false;
      return true;
    });
  }, [q, status, bookings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    if (!actioned) return;
    try {
      await approveApi(actioned.b.code);
      showToast(`อนุมัติ ${actioned.b.code} สำเร็จ`);
      router.refresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? `อนุมัติไม่สำเร็จ: ${e.message}` : "อนุมัติไม่สำเร็จ",
      );
    } finally {
      setActioned(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!actioned) return;
    try {
      await rejectApi(actioned.b.code, reason);
      showToast(`ปฏิเสธ ${actioned.b.code} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? `ปฏิเสธไม่สำเร็จ: ${e.message}` : "ปฏิเสธไม่สำเร็จ",
      );
    } finally {
      setActioned(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="ค้นหาเลขที่จอง, ผู้จอง, บริษัท, รหัสบูธ"
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">สถานะทั้งหมด</option>
            <option value="PENDING">รออนุมัติ</option>
            <option value="REVIEWING">กำลังตรวจสอบ</option>
            <option value="APPROVED">อนุมัติแล้ว</option>
            <option value="REJECTED">ปฏิเสธ</option>
            <option value="EXPIRED">หมดอายุ</option>
            <option value="CANCELLED">ยกเลิก</option>
          </Select>
          <Select>
            <option>อีเวนต์ทั้งหมด</option>
          </Select>
          <Button variant="outline">ตัวกรองเพิ่ม</Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          {filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              ไม่พบการจองที่ตรงกับเงื่อนไข
            </p>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" />
                  </th>
                  <th className="px-3 py-3">เลขที่/วันที่</th>
                  <th className="px-3 py-3">ผู้จอง / บริษัท</th>
                  <th className="px-3 py-3">อีเวนต์</th>
                  <th className="px-3 py-3">บูธ</th>
                  <th className="px-3 py-3 text-right">ยอด</th>
                  <th className="px-3 py-3">สถานะ</th>
                  <th className="px-3 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr
                    key={b.code}
                    className={`cursor-pointer transition-colors ${
                      selected?.code === b.code ? "bg-primary-soft/40" : "hover:bg-muted/30"
                    }`}
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-mono text-xs font-semibold">{b.code}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatThaiDate(b.createdAt.slice(0, 10))}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{b.companyName ?? b.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {b.fullName} • {b.phone}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{b.eventNameTh}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {b.startDate && b.endDate
                          ? `${formatThaiDate(b.startDate.slice(0, 10))} – ${formatThaiDate(b.endDate.slice(0, 10))}`
                          : "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{b.boothCode}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Zone {b.zoneName ?? "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right align-top font-semibold text-primary">
                      {formatTHB(Math.round(b.totalRent * 1.07 * 100) / 100)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <BookingStatusPill status={b.status} />
                    </td>
                    <td
                      className="px-3 py-3 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/bookings/${b.code}`}
                          title="เปิดหน้ารายละเอียด"
                          aria-label="เปิดหน้ารายละเอียด"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {b.status === "PENDING" || b.status === "REVIEWING" ? (
                          <>
                            <ActionIcon
                              icon={Check}
                              label="อนุมัติ"
                              tone="text-success hover:bg-success-soft"
                              onClick={() => setActioned({ kind: "approve", b })}
                            />
                            <ActionIcon
                              icon={X}
                              label="ปฏิเสธ"
                              tone="text-danger hover:bg-danger-soft"
                              onClick={() => setActioned({ kind: "reject", b })}
                            />
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>
              แสดง {filtered.length} จาก {bookings.length} รายการ
            </span>
          </div>
        </div>
      </div>

      <CustomerSlideIn booking={selected} />

      <ApproveDialog
        open={actioned?.kind === "approve"}
        booking={actioned?.b ?? null}
        onClose={() => setActioned(null)}
        onConfirm={handleApprove}
      />
      <RejectDialog
        open={actioned?.kind === "reject"}
        booking={actioned?.b ?? null}
        onClose={() => setActioned(null)}
        onConfirm={handleReject}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionIcon({
  icon: Icon,
  label,
  tone = "text-muted-foreground hover:bg-muted",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-md p-1.5 ${tone}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
 