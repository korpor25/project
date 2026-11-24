"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BoothStatusPill } from "@/components/ui/StatusPill";
import { deleteBooth, updateBooth } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import { formatTHB } from "@/lib/pricing";
import type { Booth, BoothStatus } from "@/types/domain";

const BOOTH_SIZES = ["2×2","2×3","2×4","2×5","3×3","3×4","3×5","4×4","4×5","5×5"];
const BOOTH_SIZE_SET = new Set(BOOTH_SIZES);

// "จองแล้ว" is settable by hand because plenty of booths get taken off-platform
// — walk-ins, phone deals, anchor tenants. Without it staff were reaching for
// "ซ่อน" to mean sold, which reads as a different thing everywhere else.
const EDITABLE_STATUS: { value: BoothStatus; label: string }[] = [
  { value: "AVAILABLE", label: "ว่าง" },
  { value: "RESERVED", label: "จองแล้ว" },
  { value: "SUSPENDED", label: "ระงับ" },
  { value: "HIDDEN", label: "ซ่อน" },
];

const STATUS_LABEL = new Map(EDITABLE_STATUS.map((s) => [s.value, s.label]));

// LOCKED is the booking flow's 5-minute hold. It clears itself, and hand-editing
// it would only race the timer — that one stays out of the picker.
const isSystemOwned = (s: BoothStatus) => s === "LOCKED";

/** Has a booking attached to it, or might have. Used for the delete warning. */
const isBooked = (s: BoothStatus) => s === "RESERVED" || s === "LOCKED";

type EditDraft = {
  id: string;
  size: string;
  price: number;
  deposit: number;
  status: BoothStatus;
};

export function EventBoothsEditor({ booths }: { booths: Booth[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(booths);
  const [syncedFrom, setSyncedFrom] = useState(booths);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // The page is force-dynamic, so router.refresh() (after a save here, or after
  // "เพิ่มบูธ" below) re-runs the server fetch and hands down a fresh `booths`.
  // Adopt it — the local rows are only there to repaint instantly on save.
  if (syncedFrom !== booths) {
    setSyncedFrom(booths);
    setRows(booths);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((b) => b.code.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const startEdit = (b: Booth) =>
    setDraft({
      id: b.id,
      size: sizeOf(b),
      price: b.price,
      deposit: 0,
      status: b.status,
    });

  const patchDraft = (patch: Partial<EditDraft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const handleSave = async () => {
    if (!draft) return;
    const [w, l] = draft.size.split(/[×x]/).map((n) => parseFloat(n.trim()) || 0);
    if (!w || !l) {
      setError("ขนาดบูธไม่ถูกต้อง — ใช้รูปแบบ กว้าง×ยาว เช่น 3×4");
      return;
    }
    if (!(draft.price >= 0)) {
      setError("ราคาต้องเป็นตัวเลขและไม่ติดลบ");
      return;
    }
    // Now that "จองแล้ว" is hand-settable it is also hand-clearable, and the
    // booth might be RESERVED because a real customer booked it. Clearing the
    // status here does not touch that booking, so say so before it happens.
    const before = rows.find((b) => b.id === draft.id);
    if (before?.status === "RESERVED" && draft.status !== "RESERVED") {
      const to = STATUS_LABEL.get(draft.status) ?? draft.status;
      const ok = confirm(
        `เปลี่ยนสถานะบูธ ${before.code} จาก "จองแล้ว" เป็น "${to}"?\n\n` +
          "ถ้าบูธนี้มีใบจองอยู่จริง การเปลี่ยนตรงนี้จะไม่ยกเลิกใบจองนั้น " +
          "ต้องไปจัดการที่หน้าการจองแยกต่างหาก",
      );
      if (!ok) return;
    }
    setBusyId(draft.id);
    setError(null);
    setSuccess(null);
    try {
      // The backend overwrites size/price/deposit unconditionally, so the whole
      // set goes on every save — see updateBooth() for the full caveat.
      await updateBooth(draft.id, {
        widthM: w,
        lengthM: l,
        price: draft.price,
        deposit: draft.deposit,
        status: draft.status,
      });
      setRows((prev) =>
        prev.map((b) =>
          b.id === draft.id
            ? { ...b, widthM: w, lengthM: l, areaSqm: w * l, price: draft.price, status: draft.status }
            : b,
        ),
      );
      setSuccess(`บันทึกบูธเรียบร้อย`);
      setDraft(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (b: Booth) => {
    const warning = isBooked(b.status)
      ? `\n\nบูธนี้มีสถานะ "${b.status === "RESERVED" ? "จองแล้ว" : "กำลังเลือก"}" — การลบจะไม่ยกเลิกใบจองที่ออกไปแล้ว`
      : "";
    if (!confirm(`ลบบูธ ${b.code}?${warning}`)) return;
    setBusyId(b.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteBooth(b.id);
      setRows((prev) => prev.filter((x) => x.id !== b.id));
      setSuccess(`ลบบูธ ${b.code} แล้ว`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "ลบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <article id="event-booths" className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">
          บูธในอีเวนต์นี้
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {rows.length} บูธ
          </span>
        </h2>
        {rows.length > 8 && (
          <div className="relative w-48">
            <Search
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหารหัสบูธ"
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        แก้ราคา ขนาด และสถานะของบูธที่สร้างไว้แล้ว — เช่น กรณีใส่ราคาผิด
        (รหัสบูธแก้ไม่ได้ ถ้าต้องเปลี่ยนให้ลบแล้วสร้างใหม่)
      </p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          ยังไม่มีบูธในอีเวนต์นี้ — เพิ่มได้ที่หัวข้อ “เพิ่มบูธ” ด้านล่าง
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">รหัส</th>
                <th className="px-3 py-2 font-medium">ขนาด (ม.)</th>
                <th className="px-3 py-2 font-medium">ราคา / วัน (บาท)</th>
                <th className="px-3 py-2 font-medium">สถานะ</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((b) => {
                const editing = draft?.id === b.id;
                const busy = busyId === b.id;

                if (!editing) {
                  return (
                    <tr key={b.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-xs font-semibold">{b.code}</td>
                      <td className="px-3 py-2 text-muted-foreground">{sizeOf(b) || "—"}</td>
                      <td className="px-3 py-2 font-semibold text-primary">
                        {formatTHB(b.price)}
                      </td>
                      <td className="px-3 py-2">
                        <BoothStatusPill status={b.status} paid={b.paid} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            disabled={busy || !!draft}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b)}
                            disabled={busy || !!draft}
                            className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                            aria-label={`ลบบูธ ${b.code}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={b.id} className="bg-primary-soft/30">
                    <td className="px-3 py-2 font-mono text-xs font-semibold">{b.code}</td>
                    <td className="px-3 py-1.5">
                      <Select
                        value={BOOTH_SIZE_SET.has(draft.size) ? draft.size : "custom"}
                        onChange={(e) =>
                          patchDraft({ size: e.target.value === "custom" ? "" : e.target.value })
                        }
                      >
                        {BOOTH_SIZES.map((s) => (
                          <option key={s} value={s}>{s} ม.</option>
                        ))}
                        <option value="custom">กำหนดเอง</option>
                      </Select>
                      {!BOOTH_SIZE_SET.has(draft.size) && (
                        <Input
                          value={draft.size}
                          onChange={(e) => patchDraft({ size: e.target.value })}
                          placeholder="เช่น 3.5×4"
                          className="mt-1"
                        />
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        step={100}
                        min={0}
                        autoFocus
                        value={draft.price}
                        onChange={(e) => patchDraft({ price: Number(e.target.value) })}
                      />
                      <label className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        มัดจำ
                        <Input
                          type="number"
                          step={100}
                          min={0}
                          value={draft.deposit}
                          onChange={(e) => patchDraft({ deposit: Number(e.target.value) })}
                          className="h-7 w-24 text-xs"
                        />
                      </label>
                    </td>
                    <td className="px-3 py-1.5">
                      {isSystemOwned(b.status) ? (
                        <div className="space-y-1">
                          <BoothStatusPill status={b.status} paid={b.paid} />
                          <p className="text-[11px] text-muted-foreground">
                            ลูกค้ากำลังกรอกฟอร์ม — รอ 5 นาทีจะปลดเอง
                          </p>
                        </div>
                      ) : (
                        <Select
                          value={draft.status}
                          onChange={(e) =>
                            patchDraft({ status: e.target.value as BoothStatus })
                          }
                        >
                          {EDITABLE_STATUS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </Select>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="success" onClick={handleSave} disabled={busy}>
                          <Check className="h-3.5 w-3.5" />
                          {busy ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setDraft(null); setError(null); }}
                          disabled={busy}
                          aria-label="ยกเลิก"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    ไม่พบบูธที่ตรงกับ “{query}”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {draft && (
        <p className="mt-3 rounded-md border border-border bg-muted/30 p-2 text-[11px] text-muted-foreground">
          หมายเหตุ: API รายการบูธยังไม่ส่งค่ามัดจำเดิมกลับมา ช่อง “มัดจำ” จึงเริ่มที่ 0 ทุกครั้ง
          — ถ้าบูธนี้มีมัดจำ กรุณากรอกใหม่ก่อนบันทึก
        </p>
      )}
      {success && (
        <p className="mt-3 rounded-md border border-success/30 bg-success-soft p-2 text-xs text-success">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}
    </article>
  );
}

function sizeOf(b: Booth): string {
  if (!b.widthM || !b.lengthM) return "";
  return `${trimNum(b.widthM)}×${trimNum(b.lengthM)}`;
}

// 3.00 -> "3", 3.50 -> "3.5" so the value matches the BOOTH_SIZES options.
function trimNum(n: number): string {
  return String(Number(n));
}

