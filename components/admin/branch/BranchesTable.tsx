"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteBranch, type AdminBranch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import { BranchDialog } from "./BranchDialog";

export function BranchesTable({ branches }: { branches: AdminBranch[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<
    | { mode: "create"; branch: null }
    | { mode: "edit"; branch: AdminBranch }
    | null
  >(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (b: AdminBranch) => {
    if (!confirm(`ลบสาขา "${b.name}"?\nการกระทำนี้ไม่สามารถกู้คืนได้`)) return;
    try {
      await deleteBranch(b.id);
      flash(`ลบ ${b.name} แล้ว`);
      router.refresh();
    } catch (e) {
      flash(e instanceof ApiError ? e.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          onClick={() => setDialog({ mode: "create", branch: null })}
        >
          <Plus className="h-4 w-4" />
          เพิ่มสาขาใหม่
        </Button>
      </div>

      <section className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {branches.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            ยังไม่มีสาขา — กดปุ่ม &quot;เพิ่มสาขาใหม่&quot; เพื่อเริ่มต้น
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ชื่อสาขา</th>
                <th className="px-4 py-3">จังหวัด</th>
                <th className="px-4 py-3 text-center">ชั้น</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.province ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center">{b.floorCount}</td>
                  <td className="px-4 py-3">
                    <Badge tone={b.status === "ACTIVE" ? "success" : "danger"}>
                      {b.status === "ACTIVE" ? "ใช้งานอยู่" : "ปิดชั่วคราว"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="แก้ไข"
                        onClick={() => setDialog({ mode: "edit", branch: b })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="ลบ"
                        onClick={() => handleDelete(b)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <BranchDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        branch={dialog?.branch ?? null}
        onClose={() => setDialog(null)}
        onSaved={() => {
          flash("บันทึกสาขาแล้ว");
          router.refresh();
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
