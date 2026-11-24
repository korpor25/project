"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, PowerOff, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  createDiscountCode,
  deleteDiscountCode,
  listDiscountCodes,
  setDiscountActive,
  type DiscountCode,
} from "@/lib/api/discounts";
import { ApiError } from "@/lib/api/error";
import { formatTHB } from "@/lib/pricing";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function DiscountCodesShell() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    maxUses: "",
    expiresAt: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    listDiscountCodes()
      .then((rows) => setCodes(rows ?? []))
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "โหลดโค้ดส่วนลดล้มเหลว";
        setToast(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!form.code.trim()) { setFormError("กรุณาระบุโค้ด"); return; }
    if (!form.value || Number(form.value) <= 0) { setFormError("กรุณาระบุจำนวนส่วนลด"); return; }
    if (form.type === "PERCENT" && Number(form.value) > 100) { setFormError("ส่วนลด % ต้องไม่เกิน 100"); return; }

    setSubmitting(true);
    try {
      const created = await createDiscountCode({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setCodes((prev) => [created, ...prev]);
      setOpen(false);
      setForm({ code: "", type: "PERCENT", value: "", maxUses: "", expiresAt: "" });
      setFormError(null);
      showToast(`สร้างโค้ด ${created.code} สำเร็จ`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "สร้างโค้ดไม่สำเร็จ";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    try {
      await setDiscountActive(id, !currentlyActive);
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentlyActive } : c)),
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "ปรับสถานะไม่สำเร็จ";
      showToast(msg);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`ลบโค้ด ${code} ?`)) return;
    try {
      await deleteDiscountCode(id);
      setCodes((prev) => prev.filter((c) => c.id !== id));
      showToast(`ลบโค้ด ${code} แล้ว`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "ลบโค้ดไม่สำเร็จ";
      showToast(msg);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`คัดลอก ${code} แล้ว`);
  };

  return (
    <>
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => { setOpen(true); setFormError(null); }}>
          <Plus className="h-4 w-4" />
          สร้างโค้ดใหม่
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            กำลังโหลดข้อมูล...
          </p>
        ) : codes.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            ยังไม่มีโค้ดส่วนลดในระบบ
          </p>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">โค้ด</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ส่วนลด</th>
                <th className="px-4 py-3">ใช้ไป / จำกัด</th>
                <th className="px-4 py-3">หมดอายุ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map((c) => {
                const exhausted = c.maxUses !== undefined && c.maxUses !== null && c.usedCount >= c.maxUses;
                const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                const isActive = c.active && !exhausted && !expired;

                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{c.code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="คัดลอก"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={c.type === "PERCENT" ? "primary" : "warning"}>
                        {c.type === "PERCENT" ? "เปอร์เซ็นต์" : "เงินคงที่"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.type === "PERCENT" ? `${c.value}%` : formatTHB(c.value)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.usedCount} / {c.maxUses ?? "∞"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.expiresAt ? c.expiresAt.slice(0, 10) : "ไม่จำกัด"}
                    </td>
                    <td className="px-4 py-3">
                      {isActive ? (
                        <Badge tone="success">ใช้งานได้</Badge>
                      ) : exhausted ? (
                        <Badge tone="neutral">ใช้ครบแล้ว</Badge>
                      ) : expired ? (
                        <Badge tone="danger">หมดอายุ</Badge>
                      ) : (
                        <Badge tone="neutral">ปิดใช้งาน</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={c.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                          onClick={() => handleToggle(c.id, c.active)}
                        >
                          <PowerOff className={`h-4 w-4 ${c.active ? "text-success" : "text-muted-foreground"}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="ลบ"
                          onClick={() => handleDelete(c.id, c.code)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>สร้างโค้ดส่วนลดใหม่</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label>โค้ดส่วนลด *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="เช่น FRIEND20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}
                aria-label="สุ่มโค้ด"
              >
                <RefreshCw className="h-4 w-4" />
                สุ่ม
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ประเภทส่วนลด *</Label>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))}
              >
                <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                <option value="FIXED">เงินคงที่ (฿)</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>จำนวน *</Label>
              <Input
                type="number"
                min={1}
                max={form.type === "PERCENT" ? 100 : undefined}
                placeholder={form.type === "PERCENT" ? "เช่น 20" : "เช่น 500"}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>จำนวนครั้งสูงสุด</Label>
              <Input
                type="number"
                min={1}
                placeholder="ไม่จำกัด"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>วันหมดอายุ</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-danger">{formError}</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>ยกเลิก</Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "สร้างโค้ด"}
          </Button>
        </DialogFooter>
      </Dialog>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
