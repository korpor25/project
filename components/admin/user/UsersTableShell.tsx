"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, KeyRound, Search, ShieldOff, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  approveAdminUser,
  rejectAdminUser,
  suspendAdminUser,
  type AdminUserRow,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import { formatThaiDate } from "@/lib/pricing";
import { SuspendUserDialog } from "./SuspendUserDialog";

export function UsersTableShell({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"PENDING" | "ALL">("ALL");
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminUserRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pendingUsers = useMemo(
    () => users.filter((u) => u.status === "PENDING"),
    [users],
  );

  const filtered = useMemo(() => {
    const base = tab === "PENDING" ? pendingUsers : users;
    return base.filter((u) =>
      [u.fullName ?? "", u.email, u.companyName ?? ""].some((f) =>
        f.toLowerCase().includes(q.toLowerCase()),
      ),
    );
  }, [q, tab, users, pendingUsers]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (u: AdminUserRow) => {
    setBusyId(u.id);
    try {
      await approveAdminUser(u.id);
      showToast(`อนุมัติ ${u.fullName ?? u.email} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(
        e instanceof ApiError
          ? `อนุมัติไม่สำเร็จ: ${e.message}`
          : "อนุมัติไม่สำเร็จ",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await rejectAdminUser(rejectTarget.id, reason);
      showToast(`ปฏิเสธ ${rejectTarget.fullName ?? rejectTarget.email} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(
        e instanceof ApiError
          ? `ปฏิเสธไม่สำเร็จ: ${e.message}`
          : "ปฏิเสธไม่สำเร็จ",
      );
    } finally {
      setRejectTarget(null);
    }
  };

  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    try {
      await suspendAdminUser(suspendTarget.id, reason);
      showToast(`ระงับ ${suspendTarget.fullName ?? suspendTarget.email} แล้ว`);
      router.refresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? `ระงับไม่สำเร็จ: ${e.message}` : "ระงับไม่สำเร็จ",
      );
    } finally {
      setSuspendTarget(null);
    }
  };

  return (
    <>
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1.5 shadow-sm">
        <TabButton active={tab === "ALL"} onClick={() => setTab("ALL")}>
          ทั้งหมด ({users.length})
        </TabButton>
        <TabButton active={tab === "PENDING"} onClick={() => setTab("PENDING")}>
          รออนุมัติ
          {pendingUsers.length > 0 && (
            <span className="ml-1.5 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {pendingUsers.length}
            </span>
          )}
        </TabButton>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="ค้นหาผู้ใช้ ชื่อ อีเมล บริษัท..."
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button variant="outline">ตัวกรอง</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            {tab === "PENDING"
              ? "ไม่มีบัญชีที่รออนุมัติ"
              : "ยังไม่มีผู้ใช้งานในระบบ"}
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ผู้ใช้</th>
                <th className="px-4 py-3">อีเมล / บริษัท</th>
                <th className="px-4 py-3">วันที่สมัคร</th>
                <th className="px-4 py-3">บทบาท</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning font-semibold">
                        {(u.fullName ?? u.email).slice(0, 1).toUpperCase()}
                      </div>
                      <p className="font-medium">{u.fullName ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p>{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.companyName ?? "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatThaiDate(u.createdAt.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Badge tone={u.role === "USER" ? "neutral" : "primary"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(u.status)}>
                      {statusLabel(u.status)}
                    </Badge>
                    {u.suspendedReason && (
                      <p className="mt-1 text-[10px] text-danger">{u.suspendedReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button variant="ghost" size="icon" aria-label="ดูโปรไฟล์">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" aria-label="รีเซตรหัสผ่าน">
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {u.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => handleApprove(u)}
                          >
                            <Check className="h-4 w-4" />
                            อนุมัติ
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="ปฏิเสธ"
                            disabled={busyId === u.id}
                            onClick={() => setRejectTarget(u)}
                          >
                            <X className="h-4 w-4 text-danger" />
                          </Button>
                        </>
                      )}
                      {u.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="ระงับ"
                          onClick={() => setSuspendTarget(u)}
                        >
                          <ShieldOff className="h-4 w-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SuspendUserDialog
        open={!!suspendTarget}
        user={suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
      />

      <SuspendUserDialog
        open={!!rejectTarget}
        user={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        copy={{
          title: "ปฏิเสธการสมัครสมาชิก",
          subtitle: "ผู้ใช้จะเห็นเหตุผลนี้และติดต่อทีมงานเพื่อขอตรวจสอบใหม่ได้",
          warning:
            "⚠️ บัญชีจะยังอยู่ในระบบแต่เข้าใช้งานไม่ได้ หากต้องการเปิดให้ใช้ภายหลัง กดอนุมัติจากแท็บรออนุมัติได้",
          reasonLabel: "เหตุผลที่ปฏิเสธ",
          reasonPlaceholder: "เช่น ข้อมูลไม่ครบถ้วน, ติดต่อกลับไม่ได้...",
          confirmLabel: "ยืนยันปฏิเสธ",
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function statusTone(status: string) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  return "danger" as const;
}

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "ใช้งานอยู่";
    case "PENDING":
      return "รออนุมัติ";
    case "REJECTED":
      return "ไม่อนุมัติ";
    default:
      return "ระงับ";
  }
}
