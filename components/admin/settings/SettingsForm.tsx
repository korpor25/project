"use client";

import { useState } from "react";
import { Building, CreditCard, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { updateSettings, type AppSettings } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [draft, setDraft] = useState<AppSettings>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    setSubmitting(true);
    setStatus(null);
    try {
      const saved = await updateSettings(draft);
      setDraft(saved);
      setStatus({ kind: "ok", msg: "บันทึกการตั้งค่าแล้ว" });
    } catch (e) {
      setStatus({
        kind: "err",
        msg: e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section icon={Building} title="ข้อมูลบริษัท">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อบริษัท">
            <Input
              value={draft.companyName}
              onChange={(e) => set("companyName", e.target.value)}
            />
          </Field>
          <Field label="เลขผู้เสียภาษี">
            <Input
              value={draft.taxId ?? ""}
              onChange={(e) => set("taxId", e.target.value)}
            />
          </Field>
          <Field label="โทรศัพท์ติดต่อ">
            <Input
              value={draft.contactPhone ?? ""}
              onChange={(e) => set("contactPhone", e.target.value)}
              placeholder="02 279 2884"
            />
          </Field>
          <Field label="อีเมล">
            <Input
              type="email"
              value={draft.contactEmail ?? ""}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </Field>
          <Field label="ที่อยู่" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={draft.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="999/9 ถนน..."
            />
          </Field>
        </div>
      </Section>

      <Section icon={Palette} title="แบรนด์และโดเมน">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="สีหลัก (Primary)">
            <div className="flex gap-2">
              <input
                type="color"
                value={draft.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-border"
              />
              <Input
                value={draft.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="font-mono"
              />
            </div>
          </Field>
          <Field label="สี Hero / Navy">
            <div className="flex gap-2">
              <input
                type="color"
                value={draft.heroColor}
                onChange={(e) => set("heroColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-border"
              />
              <Input
                value={draft.heroColor}
                onChange={(e) => set("heroColor", e.target.value)}
                className="font-mono"
              />
            </div>
          </Field>
          <Field label="โดเมนหลัก">
            <Input
              value={draft.domain ?? ""}
              onChange={(e) => set("domain", e.target.value)}
              placeholder="csexhibition.com"
            />
          </Field>
          <Field label="ชื่อเว็บไซต์ (SEO)">
            <Input
              value={draft.seoTitle ?? ""}
              onChange={(e) => set("seoTitle", e.target.value)}
            />
          </Field>
          <Field label="คำอธิบาย (Meta description)" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={draft.seoDescription ?? ""}
              onChange={(e) => set("seoDescription", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section icon={CreditCard} title="โครงสร้างราคา">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ค่าบริการ (%)">
            <Input
              type="number"
              step="0.1"
              value={draft.serviceFeePct}
              onChange={(e) => set("serviceFeePct", Number(e.target.value))}
            />
          </Field>
          <Field label="เงินมัดจำ (%)">
            <Input
              type="number"
              step="0.1"
              value={draft.depositPct}
              onChange={(e) => set("depositPct", Number(e.target.value))}
            />
          </Field>
          <Field label="VAT (%)">
            <Input
              type="number"
              step="0.1"
              value={draft.vatPct}
              onChange={(e) => set("vatPct", Number(e.target.value))}
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ค่าเหล่านี้ใช้คำนวณราคาตอนสร้างการจองใหม่ — การจองที่ส่งไปแล้วใช้ค่าเดิม
        </p>
      </Section>

      <div className="flex items-center justify-between gap-3">
        {status ? (
          <p
            className={`rounded-md px-3 py-1.5 text-sm ${
              status.kind === "ok"
                ? "border border-success/30 bg-success-soft text-success"
                : "border border-danger/30 bg-danger-soft text-danger"
            }`}
          >
            {status.msg}
          </p>
        ) : draft.updatedAt ? (
          <p className="text-xs text-muted-foreground">
            อัปเดตล่าสุด {draft.updatedAt.replace("T", " ").slice(0, 19)}
          </p>
        ) : (
          <span />
        )}
        <Button onClick={handleSave} disabled={submitting}>
          <Save className="h-4 w-4" />
          {submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-5 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
