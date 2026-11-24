"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Plus, Save, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  createBooth,
  deleteEvent,
  listBranches,
  updateEvent,
  type AdminBranch,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import {
  buildFloorOptions,
  formatZoneArea,
  isCustomFloor,
  parseZoneArea,
  CUSTOM_FLOOR,
} from "@/lib/floors";
import { DEFAULT_PROHIBITED, DEFAULT_RULES } from "@/lib/rules";
import { BranchDialog } from "@/components/admin/branch/BranchDialog";
import { EventBoothsEditor } from "@/components/admin/booth/EventBoothsEditor";
import type { Booth } from "@/types/domain";
import {
  EventMediaSection,
  type EventMediaState,
} from "./EventMediaSection";

const BOOTH_SIZES = ["2×2","2×3","2×4","2×5","3×3","3×4","3×5","4×4","4×5","5×5"];
const BOOTH_SIZE_SET = new Set(BOOTH_SIZES);

type NewBoothRow = { id: string; number: string; size: string; price: number };

export type EditEventInitial = {
  id: string;
  nameTh: string;
  slug: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  status: "DRAFT" | "UPCOMING" | "OPEN" | "CLOSED" | "CANCELLED";
  branchId: string;
  branchName: string;
  zoneArea: string;
  floorPlanUrl?: string;
  coverUrl?: string;
  galleryUrls: string[];
  documents: { label: string; url: string }[];
  terms: string[];
  prohibitedCategories: string[];
  hiddenRules: number[];
  hiddenProhibited: number[];
};

export function EditEventForm({
  initial,
  booths = [],
}: {
  initial: EditEventInitial;
  booths?: Booth[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Media + bulk-create state
  const [media, setMedia] = useState<EventMediaState>({
    floorPlanUrl: initial.floorPlanUrl,
    coverUrl: initial.coverUrl,
    galleryUrls: initial.galleryUrls,
    documents: initial.documents,
  });

  // Branch + floor are stored on the event as one "สาขา • ชั้น" string. Edit
  // them as two pickers and re-join on save, so a wrong branch is fixed by
  // re-selecting it (or creating the missing one) instead of retyping the text.
  const parsed = parseZoneArea(initial.zoneArea);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [branchId, setBranchId] = useState(initial.branchId);
  const [floor, setFloor] = useState(parsed.floor);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);

  useEffect(() => {
    const fallbackName = initial.branchName || parsed.branchName;
    listBranches()
      .then((data) => {
        setBranches(data);
        // Older events may carry only the branch *name* inside zoneArea —
        // match it back to a real branch so the picker isn't blank.
        setBranchId(
          (cur) => cur || data.find((b) => b.name === fallbackName)?.id || "",
        );
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.branchId, initial.branchName, initial.zoneArea]);

  const selectedBranch = branches.find((b) => b.id === branchId);
  const branchName = selectedBranch?.name ?? initial.branchName ?? parsed.branchName;
  const floorOptions = buildFloorOptions(selectedBranch?.floorCount ?? 1);
  const customFloor = isCustomFloor(floor, floorOptions);

  const [newBooths, setNewBooths] = useState<NewBoothRow[]>([
    { id: "nb0", number: "", size: "2×2", price: 5000 },
  ]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  const set = <K extends keyof EditEventInitial>(
    k: K,
    v: EditEventInitial[K],
  ) => setDraft((d) => ({ ...d, [k]: v }));

  const addBoothRow = () =>
    setNewBooths((prev) => [...prev, { id: `nb${Date.now()}`, number: "", size: "2×2", price: 5000 }]);

  const updateBoothRow = (id: string, patch: Partial<NewBoothRow>) =>
    setNewBooths((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const removeBoothRow = (id: string) =>
    setNewBooths((prev) => prev.filter((b) => b.id !== id));

  const handleCreateBooths = async () => {
    const valid = newBooths.filter((b) => b.number.trim());
    if (!valid.length) { setBulkError("กรุณากรอกหมายเลขบูธอย่างน้อย 1 รายการ"); return; }
    setBulkSubmitting(true);
    setBulkError(null);
    setBulkSuccess(null);
    try {
      await Promise.all(
        valid.map((b) => {
          const [w, l] = b.size.split(/[×x]/).map((n) => parseFloat(n.trim()) || 2);
          return createBooth({ eventId: initial.id, code: b.number.trim(), widthM: w, lengthM: l, price: b.price, deposit: 0 });
        }),
      );
      setBulkSuccess(`สร้าง ${valid.length} บูธแล้ว`);
      setNewBooths([{ id: "nb0", number: "", size: "2×2", price: 5000 }]);
      router.refresh();
    } catch (e) {
      setBulkError(e instanceof ApiError ? e.message : "สร้างไม่สำเร็จ");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateEvent(initial.id, {
        nameTh: draft.nameTh,
        slug: draft.slug || undefined,
        category: draft.category || undefined,
        description: draft.description || undefined,
        startDate: draft.startDate,
        endDate: draft.endDate,
        openTime: draft.openTime || undefined,
        closeTime: draft.closeTime || undefined,
        status: draft.status,
        branchId: branchId || undefined,
        zoneArea: formatZoneArea(branchName, floor) || undefined,
        hiddenRules: draft.hiddenRules,
        hiddenProhibited: draft.hiddenProhibited,
      });
      setSuccess("บันทึกการแก้ไขแล้ว");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "ไม่สามารถบันทึกได้ กรุณาลองใหม่",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `ลบอีเวนต์ "${initial.nameTh}"?\nจะลบบูธและข้อมูลที่เกี่ยวข้องทั้งหมด (อีเวนต์ที่มีการจองอยู่จะยังลบไม่ได้)`,
      )
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteEvent(initial.id);
      router.push("/admin/events");
    } catch (e) {
      // The backend can't yet delete an event that has bookings — bookings
      // reference events with ON DELETE RESTRICT, so the DELETE fails server-side
      // (surfaces as a 500). Show a clear reason instead of the raw error until
      // the backend supports cascading the delete.
      if (e instanceof ApiError && e.status >= 500) {
        setError(
          "ลบไม่สำเร็จ — อีเวนต์นี้มีการจองอยู่ ระบบยังไม่รองรับการลบอีเวนต์ที่มีการจอง กรุณาติดต่อทีมผู้ดูแลระบบ",
        );
      } else {
        setError(e instanceof ApiError ? e.message : "ลบไม่สำเร็จ กรุณาลองใหม่");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">ข้อมูลพื้นฐาน</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่ออีเวนต์ (ไทย)" className="sm:col-span-2">
              <Input
                value={draft.nameTh}
                onChange={(e) => set("nameTh", e.target.value)}
              />
            </Field>
            <Field label="Slug">
              <Input
                value={draft.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
            <Field label="หมวดหมู่">
              <Select
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option>Fashion</option>
                <option>Food</option>
                <option>Beauty</option>
                <option>Lifestyle</option>
                <option>Tech</option>
                <option>Pet</option>
              </Select>
            </Field>
            <Field label="วันที่เริ่ม">
              <Input
                type="date"
                value={draft.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="วันที่สิ้นสุด">
              <Input
                type="date"
                value={draft.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </Field>
            <Field label="เวลาเปิด">
              <Input
                type="time"
                value={draft.openTime}
                onChange={(e) => set("openTime", e.target.value)}
              />
            </Field>
            <Field label="เวลาปิด">
              <Input
                type="time"
                value={draft.closeTime}
                onChange={(e) => set("closeTime", e.target.value)}
              />
            </Field>
            <Field
              label="สาขา (ห้าง)"
              hint={
                branches.length && !branchId
                  ? "ยังไม่ได้เลือกสาขา"
                  : "เลือกผิด? เปลี่ยนได้ที่นี่ หรือกด + เพื่อเพิ่มสาขาใหม่"
              }
            >
              <div className="flex gap-2">
                <Select
                  value={branchId}
                  className="flex-1"
                  onChange={(e) => {
                    setBranchId(e.target.value);
                    // A hand-typed floor (B1, ชั้นลอย…) isn't tied to the
                    // branch's floor count, so keep it. Only a picked floor the
                    // new branch doesn't have needs resetting.
                    const next = buildFloorOptions(
                      branches.find((b) => b.id === e.target.value)?.floorCount ?? 1,
                    );
                    if (!customFloor && !next.includes(floor)) {
                      setFloor(next[0] ?? "");
                    }
                  }}
                >
                  {branches.length === 0 && <option value="">กำลังโหลด...</option>}
                  {branches.length > 0 && !branchId && (
                    <option value="">— เลือกสาขา —</option>
                  )}
                  {/* Branch the event points at but that the list doesn't
                      return (deleted / filtered out) — keep it visible so the
                      picker never renders blank. */}
                  {branchId && !selectedBranch && (
                    <option value={branchId}>{branchName || "สาขาเดิม"}</option>
                  )}
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setBranchDialogOpen(true)}
                  title="เพิ่มสาขาใหม่"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มสาขา
                </Button>
              </div>
            </Field>
            <Field label="ชั้น" hint="เลือกจากรายการ หรือพิมพ์เอง เช่น B1, B2, ชั้นลอย">
              <Select
                value={customFloor ? CUSTOM_FLOOR : floor}
                onChange={(e) =>
                  setFloor(e.target.value === CUSTOM_FLOOR ? "" : e.target.value)
                }
              >
                {floorOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
                <option value={CUSTOM_FLOOR}>กำหนดเอง (พิมพ์เอง)</option>
              </Select>
              {customFloor && (
                <Input
                  className="mt-1.5"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="เช่น B1, B2, ชั้นลอย"
                />
              )}
            </Field>
            <p className="sm:col-span-2 -mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              พื้นที่โซนที่จะบันทึก:{" "}
              <span className="font-medium text-foreground">
                {formatZoneArea(branchName, floor) || "—"}
              </span>
              <Link
                href="/admin/branches"
                className="ml-auto text-primary hover:underline"
              >
                จัดการสาขาทั้งหมด
              </Link>
            </p>
            <Field label="คำอธิบาย" className="sm:col-span-2">
              <Textarea
                rows={4}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold">การแสดงผลที่หน้าเว็บลูกค้า</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            ปิดข้อที่ไม่ต้องการให้แสดง — รายการมาตรฐานของบริษัท
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <section>
              <p className="mb-2 text-sm font-medium">กฎระเบียบการใช้พื้นที่</p>
              <ul className="space-y-2">
                {DEFAULT_RULES.map((rule, i) => {
                  const visible = !draft.hiddenRules.includes(i);
                  return (
                    <li
                      key={rule}
                      className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <span className={`text-sm ${visible ? "" : "text-muted-foreground line-through"}`}>
                        {rule}
                      </span>
                      <ToggleSwitch
                        checked={visible}
                        onChange={() =>
                          set(
                            "hiddenRules",
                            draft.hiddenRules.includes(i)
                              ? draft.hiddenRules.filter((x) => x !== i)
                              : [...draft.hiddenRules, i],
                          )
                        }
                        label=""
                      />
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <p className="mb-2 text-sm font-medium">ประเภทสินค้าที่ไม่อนุญาต</p>
              <ul className="space-y-2">
                {DEFAULT_PROHIBITED.map((item, i) => {
                  const visible = !draft.hiddenProhibited.includes(i);
                  return (
                    <li
                      key={item}
                      className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <span className={`text-sm ${visible ? "" : "text-muted-foreground line-through"}`}>
                        {item}
                      </span>
                      <ToggleSwitch
                        checked={visible}
                        onChange={() =>
                          set(
                            "hiddenProhibited",
                            draft.hiddenProhibited.includes(i)
                              ? draft.hiddenProhibited.filter((x) => x !== i)
                              : [...draft.hiddenProhibited, i],
                          )
                        }
                        label=""
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">สื่อและเอกสาร</h2>
          <EventMediaSection
            eventId={initial.id}
            state={media}
            onChange={setMedia}
          />
        </article>

        <EventBoothsEditor booths={booths} />

        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold">เพิ่มบูธ</h2>
          <p className="mb-4 text-xs text-muted-foreground">กรอกรายละเอียดบูธที่ต้องการเพิ่ม</p>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">หมายเลขบูธ</th>
                  <th className="px-3 py-2 font-medium">ขนาด (ม.)</th>
                  <th className="px-3 py-2 font-medium">ราคา / วัน (บาท)</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {newBooths.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="px-3 py-1.5">
                      <Input
                        value={b.number}
                        onChange={(e) => updateBoothRow(b.id, { number: e.target.value })}
                        placeholder="เช่น A-01"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Select
                        value={BOOTH_SIZE_SET.has(b.size) ? b.size : "custom"}
                        onChange={(e) => {
                          if (e.target.value === "custom") updateBoothRow(b.id, { size: "" });
                          else updateBoothRow(b.id, { size: e.target.value });
                        }}
                      >
                        {BOOTH_SIZES.map((s) => (
                          <option key={s} value={s}>{s} ม.</option>
                        ))}
                        <option value="custom">กำหนดเอง</option>
                      </Select>
                      {!BOOTH_SIZE_SET.has(b.size) && (
                        <Input
                          type="text"
                          value={b.size}
                          onChange={(e) => updateBoothRow(b.id, { size: e.target.value })}
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
                        value={b.price}
                        onChange={(e) => updateBoothRow(b.id, { price: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => removeBoothRow(b.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                        aria-label="ลบ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={addBoothRow}>
              <Plus className="h-3.5 w-3.5" />
              เพิ่มบูธ
            </Button>
            <Button size="sm" onClick={handleCreateBooths} disabled={bulkSubmitting}>
              <PlusCircle className="h-4 w-4" />
              {bulkSubmitting ? "กำลังสร้าง..." : `สร้าง ${newBooths.filter(b => b.number.trim()).length} บูธ`}
            </Button>
          </div>

          {bulkSuccess && (
            <p className="mt-3 rounded-md border border-success/30 bg-success-soft p-2 text-xs text-success">
              {bulkSuccess}
            </p>
          )}
          {bulkError && (
            <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
              {bulkError}
            </p>
          )}
        </article>
      </section>

      <aside className="space-y-4">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <Label className="mb-1.5 block">สถานะการเผยแพร่</Label>
          <Select
            value={draft.status}
            onChange={(e) =>
              set("status", e.target.value as EditEventInitial["status"])
            }
          >
            <option value="DRAFT">ร่าง</option>
            <option value="UPCOMING">เร็ว ๆ นี้</option>
            <option value="OPEN">เปิดรับจอง</option>
            <option value="CLOSED">ปิดแล้ว</option>
            <option value="CANCELLED">ยกเลิก</option>
          </Select>

          <Button
            className="mt-4 w-full"
            variant="success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save className="h-4 w-4" />
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>

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

        <article className="rounded-xl border border-danger/30 bg-danger-soft p-5">
          <p className="text-sm font-semibold text-danger">โซน Danger</p>
          <p className="mt-1 text-xs text-foreground/70">
            การลบจะลบบูธและการจองทั้งหมดของอีเวนต์นี้ด้วย
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3 w-full"
            onClick={handleDelete}
            disabled={submitting}
          >
            <Trash2 className="h-4 w-4" />
            ลบอีเวนต์
          </Button>
        </article>
      </aside>

      <BranchDialog
        open={branchDialogOpen}
        mode="create"
        onClose={() => setBranchDialogOpen(false)}
        onSaved={(saved) => {
          // Select the branch that was just created so the admin doesn't have
          // to re-open the picker; the list refreshes with it included.
          setBranches((prev) => [...prev, saved]);
          setBranchId(saved.id);
          const next = buildFloorOptions(saved.floorCount);
          if (!customFloor && !next.includes(floor)) setFloor(next[0] ?? "");
        }}
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      {label ? <span>{label}</span> : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
 
