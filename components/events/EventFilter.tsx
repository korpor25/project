"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export type EventFilterValue = {
  q: string;
  province: string;
  branch: string;
  month: string;
  status: string;
};

export const DEFAULT_FILTER: EventFilterValue = {
  q: "",
  province: "",
  branch: "",
  month: "",
  status: "",
};

const MONTH_OPTIONS = [
  "01","02","03","04","05","06","07","08","09","10","11","12",
];

/** Everything except the free-text box — these are what the sheet holds. */
const REFINEMENTS = ["province", "branch", "month", "status"] as const;

export function EventFilter({
  value,
  branches,
  provinces,
  onChange,
}: {
  value: EventFilterValue;
  branches: string[];
  provinces: string[];
  onChange: (v: EventFilterValue) => void;
}) {
  const [local, setLocal] = useState(value);
  const [sheetOpen, setSheetOpen] = useState(false);

  const monthLabels = useMemo(
    () =>
      MONTH_OPTIONS.map((m, i) => ({
        v: m,
        label: new Date(2025, i, 1).toLocaleDateString("th-TH", { month: "long" }),
      })),
    [],
  );

  // Badge count reflects what is actually applied, not what is half-picked in
  // the sheet — otherwise the number would lie until you hit "ดูผลลัพธ์".
  const activeCount = REFINEMENTS.filter((k) => value[k] !== "").length;

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const apply = (next: EventFilterValue) => {
    setLocal(next);
    onChange(next);
    setSheetOpen(false);
  };

  const selects = (
    <>
      <Select
        value={local.province}
        onChange={(e) => setLocal({ ...local, province: e.target.value })}
      >
        <option value="">จังหวัดทั้งหมด</option>
        {provinces.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </Select>
      <Select
        value={local.branch}
        onChange={(e) => setLocal({ ...local, branch: e.target.value })}
      >
        <option value="">ห้างทั้งหมด</option>
        {branches.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </Select>
      <Select
        value={local.month}
        onChange={(e) => setLocal({ ...local, month: e.target.value })}
      >
        <option value="">เดือนทั้งหมด</option>
        {monthLabels.map(({ v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </Select>
      <Select
        value={local.status}
        onChange={(e) => setLocal({ ...local, status: e.target.value })}
      >
        <option value="">สถานะทั้งหมด</option>
        <option value="OPEN">เปิดรับจอง</option>
        <option value="UPCOMING">เร็วๆ นี้</option>
        <option value="CLOSED">ปิดแล้ว</option>
      </Select>
    </>
  );

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(local);
        }}
        // Flex, not grid: an <input> carries a browser-default intrinsic width
        // that a grid track will not shrink below, which pushed this row past a
        // 320px screen and clipped the filter button. `flex-1 min-w-0` on the
        // input makes shrinking explicit.
        className="flex w-full max-w-full items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        {/* Free text stays in the open — it is the control people reach for
            most, so hiding it behind a tap would cost more than it saves. */}
        <Input
          placeholder="ค้นหาชื่ออีเวนต์"
          className="min-w-0 flex-1 md:flex-none"
          value={local.q}
          onChange={(e) => setLocal({ ...local, q: e.target.value })}
        />

        {/* `contents` lets the four selects become grid cells of the form itself
            from md, so the desktop row stays exactly as it was. */}
        <div className="hidden md:contents">{selects}</div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setSheetOpen(true)}
          className="relative shrink-0 md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          ตัวกรอง
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>

        <Button type="submit" className="hidden md:inline-flex">
          <Search className="h-4 w-4" />
          ค้นหา
        </Button>
      </form>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="ปิดตัวกรอง"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-foreground/50 motion-safe:animate-[fadeIn_150ms_ease-out]"
          />

          {/* Anchored to the bottom so the controls and the apply button land
              under the thumb instead of at the top of a tall phone. */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-card p-5 shadow-2xl motion-safe:animate-[slideUp_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">ตัวกรอง</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="ปิด"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3">{selects}</div>

            <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
              {/* Clearing keeps whatever is typed in the search box — that is a
                  separate decision from the refinements. */}
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ ...DEFAULT_FILTER, q: local.q })}
              >
                ล้างตัวกรอง
              </Button>
              <Button type="button" size="lg" onClick={() => apply(local)}>
                ดูผลลัพธ์
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
