"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Cpu,
  FileText,
  Flag,
  Heart,
  Image as ImageIcon,
  Layers,
  Leaf,
  PawPrint,
  Plus,
  Scissors,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  UtensilsCrossed,
  Users,
  VolumeX,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Stepper } from "@/components/ui/Stepper";
import { Textarea } from "@/components/ui/Textarea";
import {
  appendEventGallery,
  createBooth,
  createEvent,
  listBranches,
  uploadEventCover,
  uploadEventFloorplan,
  type AdminBranch,
} from "@/lib/api/admin";
import type { DuplicatePrefill } from "@/lib/api/events";
import { createClient } from "@/lib/supabase/client";
import { ApiError } from "@/lib/api/error";
import {
  buildFloorOptions,
  formatZoneArea,
  isCustomFloor,
  CUSTOM_FLOOR,
} from "@/lib/floors";
import { formatTHB, formatThaiDate } from "@/lib/pricing";

const STEPS = [
  { label: "ข้อมูลพื้นฐาน" },
  { label: "พื้นที่และโซน" },
  { label: "ราคาและแพ็กเกจ" },
  { label: "สื่อและเอกสาร" },
  { label: "เผยแพร่" },
];

type BoothDraft = {
  id: string;
  number: string;
  size: string;
  price: number;
};

type ZoneDraft = {
  id: string;
  name: string;
  color: string;
  category: string;
  booths: BoothDraft[];
};

type EventRules = {
  mustStayOpen: boolean;
  noStructureModify: boolean;
  noEarlyClose: boolean;
  noNoise: boolean;
  setupDayBefore: boolean;
  noSublet: boolean;
  mustCleanUp: boolean;
  extras: string[];
};

type EventDraft = {
  nameTh: string;
  slug: string;
  branchId: string;
  floor: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  description: string;
  highlights: string;
  zones: ZoneDraft[];
  serviceFeePct: number;
  vatPct: number;
  terms: string[];
  rules: EventRules;
  cover: File[];
  gallery: File[];
  documents: File[];
  floorPlanRef: File[];
  publishStatus: "DRAFT" | "UPCOMING" | "OPEN";
};

const ZONE_PALETTE = ["#c9a24a", "#2f6cb2", "#2e9d63", "#d4900e", "#c93737", "#7a4ec3"];

const ZONE_CATEGORIES: { value: string; icon: React.ReactNode; color: string }[] = [
  { value: "แฟชั่น",    icon: <ShoppingBag className="h-3.5 w-3.5" />,     color: "#e879a0" },
  { value: "อาหาร",     icon: <UtensilsCrossed className="h-3.5 w-3.5" />, color: "#f97316" },
  { value: "บิวตี้",    icon: <Sparkles className="h-3.5 w-3.5" />,        color: "#a855f7" },
  { value: "ไลฟ์สไตล์", icon: <Heart className="h-3.5 w-3.5" />,           color: "#ec4899" },
  { value: "เทค",       icon: <Cpu className="h-3.5 w-3.5" />,             color: "#3b82f6" },
  { value: "สัตว์เลี้ยง", icon: <PawPrint className="h-3.5 w-3.5" />,      color: "#22c55e" },
  { value: "แฟร์",      icon: <Flag className="h-3.5 w-3.5" />,            color: "#ef4444" },
];

const BOOTH_SIZES = ["2×2","2×2.5","5.5×4"];
const BOOTH_SIZE_SET = new Set(BOOTH_SIZES);


const INITIAL: EventDraft = {
  nameTh: "",
  slug: "",
  branchId: "",
  floor: "ชั้น 1",
  startDate: "2026-06-01",
  endDate: "2026-06-30",
  openTime: "10:00",
  closeTime: "21:00",
  description: "",
  highlights: "",
  zones: [
    {
      id: "z1", name: "แฟชั่น", color: ZONE_PALETTE[0], category: "แฟชั่น",
      booths: [
        { id: "b1", number: "1", size: "2×2", price: 2500 },
        { id: "b2", number: "2", size: "2×2", price: 2500 },
      ],
    },
    {
      id: "z2", name: "อาหาร", color: ZONE_PALETTE[1], category: "อาหาร",
      booths: [
        { id: "b3", number: "3", size: "2×2", price: 2500 },
      ],
    },
  ],
  serviceFeePct: 10,
  vatPct: 7,
  terms: [
    "เปิดบริการตามเวลาทำการของห้าง",
  ],
  rules: {
    mustStayOpen: true,
    noStructureModify: true,
    noEarlyClose: true,
    noNoise: true,
    setupDayBefore: true,
    noSublet: false,
    mustCleanUp: true,
    extras: [],
  },
  cover: [],
  gallery: [],
  documents: [],
  floorPlanRef: [],
  publishStatus: "DRAFT",
};

// Seed the wizard from an existing event when duplicating. Carries over zones,
// booths, prices, terms and description; deliberately clears dates and media so
// the admin re-enters those. Status stays DRAFT until chosen in the publish step.
const CATEGORY_VALUES = new Set(ZONE_CATEGORIES.map((c) => c.value));

function draftFromPrefill(prefill: DuplicatePrefill): EventDraft {
  return {
    ...INITIAL,
    nameTh: prefill.sourceName,
    slug: "", // regenerated from name + new start date when dates are filled
    floor: prefill.floor,
    startDate: "",
    endDate: "",
    description: prefill.description,
    terms: prefill.terms.length ? prefill.terms : INITIAL.terms,
    zones: prefill.zones.map((z, zi) => ({
      id: `z${zi + 1}`,
      name: z.name,
      color: ZONE_PALETTE[zi % ZONE_PALETTE.length],
      category: CATEGORY_VALUES.has(z.category)
        ? z.category
        : ZONE_CATEGORIES[0].value,
      booths: z.booths.map((b, bi) => ({
        id: `z${zi + 1}-b${bi + 1}`,
        number: b.number,
        size: b.size,
        price: b.price,
      })),
    })),
  };
}

export function CreateEventWizard({ prefill }: { prefill?: DuplicatePrefill }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<EventDraft>(() =>
    prefill ? draftFromPrefill(prefill) : INITIAL,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<AdminBranch[]>([]);

  useEffect(() => {
    listBranches().then((data) => {
      setBranches(data);
      // When duplicating, re-select the source event's branch by name.
      const matched = prefill?.branchName
        ? data.find((b) => b.name === prefill.branchName)
        : undefined;
      setDraft((d) => ({
        ...d,
        branchId: d.branchId || matched?.id || data[0]?.id || "",
      }));
    }).catch(() => {});
  }, [prefill]);

  const set = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const branch = branches.find((b) => b.id === draft.branchId);
  const totalBooths = draft.zones.reduce((s, z) => s + z.booths.length, 0);
  const days =
    Math.round(
      (new Date(draft.endDate).getTime() - new Date(draft.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const handleSubmit = async () => {
    // Client-side validation pinpoints the missing field and jumps the user
    // back to the right step before we ever hit the API.
    if (!draft.nameTh.trim()) {
      setStep(0);
      setError("กรุณากรอกชื่ออีเวนต์ (ขั้นตอนแรก)");
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setStep(0);
      setError("กรุณาเลือกวันเริ่มและวันสิ้นสุด");
      return;
    }
    if (new Date(draft.endDate) < new Date(draft.startDate)) {
      setStep(0);
      setError("วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่ม");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Parse highlights freeform text into a simple object — wizard's UX
      // collects bullet lines but the API expects a key/value map.
      const highlightsLines = draft.highlights
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await createEvent({
        nameTh: draft.nameTh,
        slug: draft.slug || undefined,
        description: draft.description,
        branchId: draft.branchId || undefined,
        floorId: undefined,
        startDate: draft.startDate,
        endDate: draft.endDate,
        openTime: draft.openTime,
        closeTime: draft.closeTime,
        status: draft.publishStatus,
        zoneArea: formatZoneArea(branch?.name, draft.floor),
        highlights: highlightsLines.length
          ? { highlights: highlightsLines.join(" / ") }
          : undefined,
        terms: draft.terms.filter(Boolean),
        zones: draft.zones.map((z) => ({ name: z.name, color: z.color, category: z.category })),
      });

      // Create individual booths
      const allBooths = draft.zones.flatMap((z) => z.booths);
      if (allBooths.length > 0) {
        await Promise.all(
          allBooths.map((b) => {
            const [w, l] = b.size.split(/[×x]/).map((n) => parseFloat(n.trim()) || 2);
            return createBooth({
              eventId: result.id,
              code: b.number,
              widthM: w,
              lengthM: l,
              price: b.price,
              deposit: 0,
            });
          }),
        );
      }

      // Upload media files
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      if (token) {
        if (draft.cover[0]) {
          await uploadEventCover(result.id, draft.cover[0], token);
        }
        if (draft.floorPlanRef[0]) {
          await uploadEventFloorplan(result.id, draft.floorPlanRef[0], token);
        }
        for (const file of draft.gallery) {
          await appendEventGallery(result.id, file, token);
        }
      }

      router.push(`/admin/events?created=${result.id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        const details = e.details
          ? Object.values(e.details).join(", ")
          : "";
        setError(details ? `${e.message} (${details})` : e.message);
      } else {
        setError("ไม่สามารถบันทึกอีเวนต์ได้ กรุณาลองใหม่");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        {prefill && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-info/30 bg-info-soft p-3 text-sm">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <p className="text-foreground/80">
              ทำซ้ำจาก{" "}
              <span className="font-semibold">{prefill.sourceName}</span> —
              คัดลอกโซน บูธ และราคาให้แล้ว กรุณากรอก{" "}
              <span className="font-semibold">วันที่จัดงาน</span> ใหม่
              ก่อนเผยแพร่
            </p>
          </div>
        )}

        <Stepper steps={STEPS} current={step} />

        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && <StepBasics draft={draft} set={set} branches={branches} />}
          {step === 1 && <StepZones draft={draft} set={set} totalBooths={totalBooths} />}
          {step === 2 && <StepPricing draft={draft} set={set} />}
          {step === 3 && <StepMedia draft={draft} set={set} />}
          {step === 4 && (
            <StepPublish
              draft={draft}
              branchName={branch?.name ?? ""}
              totalBooths={totalBooths}
              days={days}
              setStatus={(s) => set("publishStatus", s)}
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              ถัดไป
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="success" onClick={handleSubmit} disabled={submitting}>
              <Check className="h-4 w-4" />
              {submitting
                ? "กำลังบันทึก..."
                : draft.publishStatus === "OPEN"
                  ? "เผยแพร่ทันที"
                  : "บันทึกร่าง"}
            </Button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      <EventSummary
        draft={draft}
        branchName={branch?.name ?? "—"}
        totalBooths={totalBooths}
        days={days}
      />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-5 flex items-start gap-3 border-b border-border pb-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-hover">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}

function StepBasics({
  draft,
  set,
  branches,
}: {
  draft: EventDraft;
  set: <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => void;
  branches: AdminBranch[];
}) {
  const selectedBranch = branches.find((b) => b.id === draft.branchId);
  const floorOptions = buildFloorOptions(selectedBranch?.floorCount ?? 1);
  const customFloor = isCustomFloor(draft.floor, floorOptions);

  return (
    <>
      <SectionHeader
        icon={CalendarDays}
        title="ข้อมูลพื้นฐานของอีเวนต์"
        subtitle="ชื่อ ประเภท สาขา และระยะเวลา"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่ออีเวนต์ (ไทย)" className="sm:col-span-2">
          <Input
            value={draft.nameTh}
            onChange={(e) => {
              const v = e.target.value;
              set("nameTh", v);
              const ym = draft.startDate ? `-${draft.startDate.slice(0, 7)}` : "";
              set(
                "slug",
                v
                  .toLowerCase()
                  .replace(/[^a-z0-9ก-๙\s-]/g, "")
                  .replace(/\s+/g, "-") + ym,
              );
            }}
            placeholder="เช่น Lifestyle Pop-up Market 2026"
          />
        </Field>
        <Field label="Slug (URL)" hint="ใช้สร้างลิงก์ /events/{slug}">
          <Input
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="lifestyle-popup-2026"
          />
        </Field>
        <Field label="สาขา">
          <Select
            value={draft.branchId}
            onChange={(e) => {
              set("branchId", e.target.value);
              // A hand-typed floor (B1, ชั้นลอย…) isn't tied to the branch's
              // floor count, so keep it. Only a picked floor that the new
              // branch doesn't have needs resetting.
              const next = buildFloorOptions(
                branches.find((b) => b.id === e.target.value)?.floorCount ?? 1,
              );
              if (!customFloor && !next.includes(draft.floor)) {
                set("floor", next[0] ?? "");
              }
            }}
          >
            {branches.length === 0 && (
              <option value="">กำลังโหลด...</option>
            )}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="ชั้น" hint="เลือกจากรายการ หรือพิมพ์เอง เช่น B1, B2">
          <Select
            value={customFloor ? CUSTOM_FLOOR : draft.floor}
            onChange={(e) =>
              set("floor", e.target.value === CUSTOM_FLOOR ? "" : e.target.value)
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
              value={draft.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder="เช่น B1, B2, ชั้นลอย"
            />
          )}
        </Field>
        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
          <Field label="วันที่เริ่ม">
            <Input
              type="date"
              value={draft.startDate}
              onChange={(e) => {
                set("startDate", e.target.value);
                if (draft.nameTh) {
                  const ym = e.target.value ? `-${e.target.value.slice(0, 7)}` : "";
                  set(
                    "slug",
                    draft.nameTh
                      .toLowerCase()
                      .replace(/[^a-z0-9ก-๙\s-]/g, "")
                      .replace(/\s+/g, "-") + ym,
                  );
                }
              }}
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
        </div>
        <Field label="คำอธิบายอีเวนต์" className="sm:col-span-2">
          <Textarea
            rows={4}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="อธิบายแนวคิดของอีเวนต์ กลุ่มเป้าหมาย และจุดเด่น"
          />
        </Field>
        <Field label="ไฮไลต์ / จุดขาย" hint="ระบุเป็นบรรทัดเว้นบรรทัด" className="sm:col-span-2">
          <Textarea
            rows={3}
            value={draft.highlights}
            onChange={(e) => set("highlights", e.target.value)}
            placeholder="• Foot traffic 100K/สัปดาห์\n• ใกล้ลานจอดรถใหญ่"
          />
        </Field>
      </div>
    </>
  );
}


function StepZones({
  draft,
  set,
  totalBooths,
}: {
  draft: EventDraft;
  set: <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => void;
  totalBooths: number;
}) {
  const updateZone = (id: string, patch: Partial<ZoneDraft>) =>
    set("zones", draft.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));

  const removeZone = (id: string) =>
    set("zones", draft.zones.filter((z) => z.id !== id));

  const addZone = () => {
    const usedColors = new Set(draft.zones.map((z) => z.color));
    const nextColor =
      ZONE_PALETTE.find((c) => !usedColors.has(c)) ??
      ZONE_PALETTE[draft.zones.length % ZONE_PALETTE.length];
    const idx = draft.zones.length;
    set("zones", [
      ...draft.zones,
      {
        id: `z${idx + 1}`,
        name: `โซน ${idx + 1}`,
        color: nextColor,
        category: "แฟชั่น",
        booths: [],
      },
    ]);
  };

  const addBooth = (zoneId: string) => {
    const zone = draft.zones.find((z) => z.id === zoneId)!;
    const allNums = draft.zones.flatMap((z) => z.booths).map((b) => parseInt(b.number) || 0);
    const nextNumber = allNums.length > 0 ? Math.max(...allNums) + 1 : 1;
    const lastPrice = zone.booths.length > 0 ? zone.booths[zone.booths.length - 1].price : 2500;
    const newBooth: BoothDraft = {
      id: `${zoneId}-b${Date.now()}`,
      number: String(nextNumber),
      size: "2×2",
      price: lastPrice,
    };
    updateZone(zoneId, { booths: [...zone.booths, newBooth] });
  };

  const updateBooth = (zoneId: string, boothId: string, patch: Partial<BoothDraft>) => {
    const zone = draft.zones.find((z) => z.id === zoneId)!;
    updateZone(zoneId, {
      booths: zone.booths.map((b) => (b.id === boothId ? { ...b, ...patch } : b)),
    });
  };

  const removeBooth = (zoneId: string, boothId: string) => {
    const zone = draft.zones.find((z) => z.id === zoneId)!;
    updateZone(zoneId, { booths: zone.booths.filter((b) => b.id !== boothId) });
  };

  return (
    <>
      <SectionHeader
        icon={Layers}
        title="พื้นที่และโซน"
        subtitle="อัปโหลดแผนผัง แบ่งโซน และกำหนดราคาแต่ละบูธ"
      />

      <div className="mb-5">
        <Label className="mb-1.5 block">แผนผังบูธ</Label>
        <FileDropzone
          accept="image/jpeg,image/png,image/webp,application/pdf"
          label="อัปโหลดแผนผัง"
          hint="รองรับ JPG, PNG, PDF"
          value={draft.floorPlanRef}
          onChange={(files) => set("floorPlanRef", files.slice(0, 1))}
        />
        {draft.floorPlanRef[0]?.type.startsWith("image/") && (
          <img
            src={URL.createObjectURL(draft.floorPlanRef[0])}
            alt="แผนผัง"
            className="mt-2 w-full rounded-lg border border-border object-contain min-h-[600px]"
          />
        )}
        {draft.floorPlanRef[0]?.type === "application/pdf" && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {draft.floorPlanRef[0].name}
          </p>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ทั้งหมด <span className="font-semibold text-foreground">{draft.zones.length}</span> โซน •{" "}
          <span className="font-semibold text-foreground">{totalBooths}</span> บูธ
        </p>
        <Button size="sm" variant="outline" onClick={addZone}>
          + เพิ่มโซน
        </Button>
      </div>

      <div className="space-y-4">
        {draft.zones.map((z) => (
          <div key={z.id} className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[44px_1fr_1fr_auto]">
              <label className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md ring-2 ring-white/80 text-white" style={{ background: z.color }} title="เลือกสี">
                {ZONE_CATEGORIES.find((c) => c.value === z.category)?.icon}
                <input
                  type="color"
                  value={z.color}
                  onChange={(e) => updateZone(z.id, { color: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <Field label="ชื่อโซน">
                <Input
                  value={z.name}
                  onChange={(e) => updateZone(z.id, { name: e.target.value })}
                />
              </Field>
              <Field label="หมวดหมู่">
                <Select value={z.category} onChange={(e) => updateZone(z.id, { category: e.target.value })}>
                  {ZONE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.value}</option>
                  ))}
                </Select>
              </Field>
              <button
                type="button"
                onClick={() => removeZone(z.id)}
                className="self-end rounded-md p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                aria-label="ลบโซน"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {z.booths.length > 0 && (
              <div className="mb-3 overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">บูธ</th>
                      <th className="px-3 py-2 font-medium">ขนาด (ม.)</th>
                      <th className="px-3 py-2 font-medium">ราคา / วัน (บาท)</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {z.booths.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="px-3 py-1.5">
                          <Input
                            value={b.number}
                            onChange={(e) => updateBooth(z.id, b.id, { number: e.target.value })}
                            placeholder="1"
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <Select
                            value={BOOTH_SIZE_SET.has(b.size) ? b.size : "custom"}
                            onChange={(e) => {
                              if (e.target.value === "custom") updateBooth(z.id, b.id, { size: "" });
                              else updateBooth(z.id, b.id, { size: e.target.value });
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
                              onChange={(e) => updateBooth(z.id, b.id, { size: e.target.value })}
                              placeholder="เช่น 3.5×4"
                              className="mt-1"
                            />
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            type="number"
                            step="100"
                            min="0"
                            value={b.price}
                            onChange={(e) => updateBooth(z.id, b.id, { price: Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-1.5">
                          <button
                            type="button"
                            onClick={() => removeBooth(z.id, b.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                            aria-label="ลบบูธ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Button size="sm" variant="outline" onClick={() => addBooth(z.id)}>
              <Plus className="h-3.5 w-3.5" />
              เพิ่มบูธ
            </Button>
          </div>
        ))}
      </div>

      <ZonePreview zones={draft.zones} />
    </>
  );
}

function ZonePreview({ zones }: { zones: ZoneDraft[] }) {
  const total = zones.reduce((s, z) => s + z.booths.length, 0) || 1;
  return (
    <div className="mt-5 rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">สัดส่วนพื้นที่</p>
      <div className="flex h-10 w-full overflow-hidden rounded-md ring-1 ring-border">
        {zones.map((z) => (
          <div
            key={z.id}
            className="flex items-center justify-center text-[11px] font-medium text-white"
            style={{
              background: z.color,
              width: `${(z.booths.length / total) * 100}%`,
            }}
            title={`${z.name}: ${z.booths.length} บูธ`}
          >
            {z.booths.length > 2 ? z.name : ""}
          </div>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {zones.map((z) => (
          <li key={z.id} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: z.color }} aria-hidden />
            <span className="font-medium">{z.name}</span>
            <span className="text-muted-foreground">— {z.booths.length} บูธ</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const RULES_CONFIG: {
  key: keyof Omit<EventRules, "extras">;
  icon: React.ReactNode;
  label: string;
  hint: string;
}[] = [
  {
    key: "mustStayOpen",
    icon: <Store className="h-4 w-4" />,
    label: "ผู้เช่าต้องเปิดร้านตลอดระยะเวลางาน",
    hint: "ต้องเปิดร้านทุกวันตลอดเวลาที่กำหนด",
  },
  {
    key: "noStructureModify",
    icon: <Scissors className="h-4 w-4" />,
    label: "ห้ามเจาะ ตัด แปลงโครงสร้าง",
    hint: "ห้ามเจาะผนัง พื้น เพดาน หรือโครงสร้างของสถานที่",
  },
  {
    key: "noEarlyClose",
    icon: <Clock className="h-4 w-4" />,
    label: "ห้ามปิดร้านก่อนเวลา",
    hint: "ห้ามเก็บสินค้า หรือปิดร้านก่อนเวลาที่กำหนด",
  },
  {
    key: "noNoise",
    icon: <VolumeX className="h-4 w-4" />,
    label: "ห้ามใช้เสียงดัง / อุปกรณ์รบกวน",
    hint: "ห้ามใช้เสียงดังหรืออุปกรณ์รบกวนผู้อื่น",
  },
  {
    key: "setupDayBefore",
    icon: <Wrench className="h-4 w-4" />,
    label: "ต้องติดตั้งร้านก่อนงาน 1 วัน",
    hint: "ต้องมาติดตั้งก่อน 1 วันเวลาห้างปิด",
  },
  {
    key: "noSublet",
    icon: <Users className="h-4 w-4" />,
    label: "ห้ามแบ่งพื้นที่ให้ผู้อื่น",
    hint: "ห้ามโอนสิทธิ์หรือแบ่งพื้นที่ให้บุคคลอื่น",
  },
  {
    key: "mustCleanUp",
    icon: <Leaf className="h-4 w-4" />,
    label: "ต้องรักษาความสะอาด",
    hint: "รักษาความสะอาดและจัดเก็บขยะตัวเองเป็นประจำ",
  },
];

function StepPricing({
  draft,
  set,
}: {
  draft: EventDraft;
  set: <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => void;
}) {

  const updateTerm = (idx: number, value: string) =>
    set("terms", draft.terms.map((t, i) => (i === idx ? value : t)));
  const addTerm = () => set("terms", [...draft.terms, ""]);
  const removeTerm = (idx: number) =>
    set("terms", draft.terms.filter((_, i) => i !== idx));

  return (
    <>
      <SectionHeader
        icon={Tag}
        title="ราคาและแพ็กเกจ"
        subtitle="ค่าบริการระบบ ภาษี และส่วนลด Early Bird"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ค่าบริการระบบ (%)" hint="คิดจากค่าเช่าพื้นที่แต่ละบูธ">
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={draft.serviceFeePct}
            onChange={(e) => set("serviceFeePct", Number(e.target.value))}
          />
        </Field>
        <Field label="VAT (%)" hint="ใช้อัตรา 7% ตามกฎหมาย">
          <Input value={`${draft.vatPct}%`} disabled className="opacity-60" />
        </Field>
      </div>


      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <Label>เงื่อนไขการเช่า</Label>
          <Button size="sm" variant="outline" onClick={addTerm}>
            + เพิ่มเงื่อนไข
          </Button>
        </div>
        <ul className="space-y-2">
          {draft.terms.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input
                value={t}
                onChange={(e) => updateTerm(i, e.target.value)}
                placeholder="เช่น เปิดบริการตามเวลาทำการของห้าง"
              />
              <button
                type="button"
                onClick={() => removeTerm(i)}
                className="rounded-md p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                aria-label="ลบ"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <RulesSection rules={draft.rules} onChange={(r) => set("rules", r)} />
    </>
  );
}

function RulesSection({
  rules,
  onChange,
}: {
  rules: EventRules;
  onChange: (r: EventRules) => void;
}) {
  const patch = (p: Partial<EventRules>) => onChange({ ...rules, ...p });
  const addExtra = () => patch({ extras: [...rules.extras, ""] });
  const updateExtra = (i: number, v: string) =>
    patch({ extras: rules.extras.map((x, idx) => (idx === i ? v : x)) });
  const removeExtra = (i: number) =>
    patch({ extras: rules.extras.filter((_, idx) => idx !== i) });

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <FileText className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold">กฎระเบียบและเงื่อนไขการใช้พื้นที่</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {RULES_CONFIG.map(({ key, icon, label, hint }) => (
          <RuleCard
            key={key}
            icon={icon}
            label={label}
            hint={hint}
            checked={rules[key as keyof Omit<EventRules, "extras">] as boolean}
            onCheck={(v) => patch({ [key]: v })}
          />
        ))}
      </div>

      {rules.extras.length > 0 && (
        <div className="mt-3 space-y-2">
          {rules.extras.map((x, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <Input
                value={x}
                onChange={(e) => updateExtra(i, e.target.value)}
                placeholder="เช่น ห้ามนำสัตว์เลี้ยงเข้าพื้นที่"
              />
              <button
                type="button"
                onClick={() => removeExtra(i)}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addExtra}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        เพิ่มกฎ
      </button>
    </div>
  );
}

function RuleCard({
  icon,
  label,
  hint,
  checked,
  onCheck,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-3 transition-colors ${
        checked ? "border-primary/40 bg-primary-soft/20" : "border-border"
      }`}
    >
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              checked ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`h-5 w-9 rounded-full transition-colors ${
              checked ? "bg-primary" : "bg-border"
            }`}
          />
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </label>
    </div>
  );
}

function StepMedia({
  draft,
  set,
}: {
  draft: EventDraft;
  set: <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => void;
}) {
  return (
    <>
      <SectionHeader
        icon={ImageIcon}
        title="สื่อและรูปภาพ"
        subtitle="รูปปกแบนเนอร์ แผนผังบูธ และรูปภาพประกอบ"
      />
      <div className="space-y-6">
        {/* Cover banner */}
        <div>
          <Label className="mb-1.5 block">รูปภาพปกแบนเนอร์อีเวนต์</Label>
          <FileDropzone
            accept="image/jpeg,image/png,image/webp"
            label="อัปโหลดรูปปก"
            hint="แนะนำ 1600×900 px • ไม่เกิน 5 MB"
            value={draft.cover}
            onChange={(files) => set("cover", files.slice(0, 1))}
          />
          {draft.cover[0] && (
            <img
              src={URL.createObjectURL(draft.cover[0])}
              alt="ตัวอย่างรูปปก"
              className="mt-2 h-96 w-full rounded-lg border border-border object-cover"
            />
          )}
        </div>

        {/* Gallery */}
        <div>
          <Label className="mb-1.5 block">รูปภาพประกอบ</Label>
          <FileDropzone
            multiple
            accept="image/jpeg,image/png,image/webp"
            label="อัปโหลดได้สูงสุด 12 รูป"
            value={draft.gallery}
            onChange={(files) => set("gallery", files.slice(0, 12))}
          />
          {draft.gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {draft.gallery.map((file, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`รูป ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set("gallery", draft.gallery.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="ลบรูป"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StepPublish({
  draft,
  branchName,
  totalBooths,
  days,
  setStatus,
}: {
  draft: EventDraft;
  branchName: string;
  totalBooths: number;
  days: number;
  setStatus: (s: EventDraft["publishStatus"]) => void;
}) {
  const options: { value: EventDraft["publishStatus"]; label: string; desc: string }[] = [
    { value: "DRAFT", label: "ร่าง", desc: "บันทึกไว้ก่อน ยังไม่เผยแพร่" },
    { value: "UPCOMING", label: "เร็ว ๆ นี้", desc: "ขึ้นโฮมเพจในหมวด Upcoming ยังไม่เปิดจอง" },
    { value: "OPEN", label: "เปิดรับจอง", desc: "เผยแพร่และเปิดให้ผู้ใช้จองทันที" },
  ];

  return (
    <>
      <SectionHeader
        icon={Sparkles}
        title="ทบทวนและเผยแพร่"
        subtitle="ตรวจสอบรายละเอียดและเลือกสถานะการเผยแพร่"
      />

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <ReviewRow label="ชื่ออีเวนต์" value={draft.nameTh || "—"} full />
        <ReviewRow label="หมวดหมู่" value={draft.zones.map((z) => z.category).join(", ") || "—"} />
        <ReviewRow label="สาขา / ชั้น" value={formatZoneArea(branchName, draft.floor)} />
        <ReviewRow
          label="ระยะเวลา"
          value={`${formatThaiDate(draft.startDate)} – ${formatThaiDate(draft.endDate)} (${days} วัน)`}
          full
        />
        <ReviewRow label="เวลา" value={`${draft.openTime} – ${draft.closeTime}`} />
        <ReviewRow label="โซน / บูธ" value={`${draft.zones.length} โซน • ${totalBooths} บูธ`} />
        <ReviewRow label="ช่วงราคา / วัน" value={(() => {
          const prices = draft.zones.flatMap(z => z.booths).map(b => b.price);
          if (!prices.length) return "—";
          const min = Math.min(...prices), max = Math.max(...prices);
          return min === max ? formatTHB(min) : `${formatTHB(min)} – ${formatTHB(max)}`;
        })()} highlight />
        <ReviewRow label="รูปปก" value={draft.cover.length ? "อัปโหลดแล้ว" : "ยังไม่มี"} />
        <ReviewRow label="แกลเลอรี" value={`${draft.gallery.length} ไฟล์`} />
      </dl>

      <div className="mt-6">
        <Label className="mb-2 block">สถานะการเผยแพร่</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatus(o.value)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                draft.publishStatus === o.value
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-primary/60"
              }`}
            >
              <p className="text-sm font-semibold">{o.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{o.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ReviewRow({
  label,
  value,
  highlight,
  full,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`mt-1 ${
          highlight ? "text-lg font-bold text-primary" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function EventSummary({
  draft,
  branchName,
  totalBooths,
  days,
}: {
  draft: EventDraft;
  branchName: string;
  totalBooths: number;
  days: number;
}) {
  return (
    <aside className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {draft.cover[0] ? (
          <img
            src={URL.createObjectURL(draft.cover[0])}
            alt="ตัวอย่างรูปปก"
            className="h-28 w-full object-cover"
          />
        ) : (
          <div
            className="h-28 w-full bg-gradient-to-br from-[#5a4326] via-[#8a6b3c] to-[#c9a24a]"
            aria-hidden
          />
        )}
        <div className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">สรุปอีเวนต์</p>
          <p className="mt-2 text-base font-bold leading-tight">
            {draft.nameTh || "ยังไม่ได้ตั้งชื่อ"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatZoneArea(branchName, draft.floor)}
          </p>

          <dl className="mt-4 space-y-2.5 text-sm">
            <SummaryRow label="หมวดหมู่" value={draft.zones.map((z) => z.category).join(", ") || "—"} />
            <SummaryRow label="ระยะเวลา" value={`${days} วัน`} />
            <SummaryRow label="โซน / บูธ" value={`${draft.zones.length} / ${totalBooths}`} />
            <SummaryRow label="ช่วงราคา / วัน" value={(() => {
              const prices = draft.zones.flatMap(z => z.booths).map(b => b.price);
              if (!prices.length) return "—";
              const min = Math.min(...prices), max = Math.max(...prices);
              return min === max ? formatTHB(min) : `${formatTHB(min)} – ${formatTHB(max)}`;
            })()} highlight />
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-info/30 bg-info-soft p-4 text-sm">
        <FileText className="mb-2 h-4 w-4 text-info" />
        <p className="font-semibold text-info">ทำให้สมบูรณ์</p>
        <p className="mt-1 text-foreground/80">
          เพิ่มรูปปก, สรุปไฮไลต์ และเอกสารดาวน์โหลด เพื่อให้ลูกค้าได้รับข้อมูลครบถ้วน
        </p>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={highlight ? "font-bold text-primary" : "font-medium"}>{value}</dd>
    </div>
  );
}
 
