"use client";

import { useState } from "react";
import {
  Bell,
  Building,
  CreditCard,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  Palette,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type TabKey = "general" | "branding" | "payment" | "notifications" | "security";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "general", label: "ทั่วไป", icon: Building },
  { key: "branding", label: "แบรนด์", icon: Palette },
  { key: "payment", label: "การชำระเงิน", icon: CreditCard },
  { key: "notifications", label: "การแจ้งเตือน", icon: Bell },
  { key: "security", label: "ความปลอดภัย", icon: ShieldCheck },
];

export function SettingsPanel() {
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav className="space-y-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary-soft font-semibold text-primary-hover"
                  : "hover:bg-muted"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-6">
        {tab === "general" && <GeneralTab />}
        {tab === "branding" && <BrandingTab />}
        {tab === "payment" && <PaymentTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "security" && <SecurityTab />}

        <div className="flex justify-end gap-2">
          <Button variant="outline">ยกเลิก</Button>
          <Button>
            <Save className="h-4 w-4" />
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-5 border-b border-border pb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
  inline,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
        <div>
          <Label>{label}</Label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {children}
      </div>
    );
  }
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <Section title="ข้อมูลบริษัท" subtitle="ข้อมูลทั่วไปของ CS Exhibition">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อบริษัท">
            <Input defaultValue="CS Exhibition Co., Ltd." />
          </Field>
          <Field label="เลขประจำตัวผู้เสียภาษี">
            <Input defaultValue="0105561023456" />
          </Field>
          <Field label="ที่อยู่" hint="ใช้ในใบเสร็จ/ใบกำกับภาษี">
            <Textarea
              rows={3}
              defaultValue="999/9 ถนนพระราม 4 แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพมหานคร 10120"
            />
          </Field>
          <Field label="โทรศัพท์ติดต่อ">
            <Input defaultValue="02 279 2884" />
          </Field>
          <Field label="อีเมล">
            <Input type="email" defaultValue="info@csexhibition.com" />
          </Field>
        </div>
      </Section>

      <Section title="พื้นที่และภาษา">
        <Field label="ภาษาเริ่มต้น" inline>
          <Select className="w-40" defaultValue="th">
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </Select>
        </Field>
        <Field label="เขตเวลา" inline>
          <Select className="w-56" defaultValue="bkk">
            <option value="bkk">Asia/Bangkok (UTC+7)</option>
            <option value="utc">UTC</option>
          </Select>
        </Field>
        <Field label="รูปแบบวันที่" inline>
          <Select className="w-56" defaultValue="thai">
            <option value="thai">15 พฤษภาคม 2569</option>
            <option value="iso">2026-05-15</option>
          </Select>
        </Field>
      </Section>
    </>
  );
}

function BrandingTab() {
  return (
    <>
      <Section title="โลโก้และสี">
        <Field label="โลโก้หลัก" hint="ใช้บน Navbar และอีเมล • PNG/SVG • สูงสุด 1 MB">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
            <Button variant="outline" size="sm">
              อัปโหลด
            </Button>
          </div>
        </Field>

        <Field label="สีหลัก (Primary)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue="#c9a24a"
              className="h-10 w-12 cursor-pointer rounded border border-border"
            />
            <Input defaultValue="#C9A24A" className="font-mono" />
          </div>
        </Field>

        <Field label="สี Hero / Navy">
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue="#3a2916"
              className="h-10 w-12 cursor-pointer rounded border border-border"
            />
            <Input defaultValue="#3A2916" className="font-mono" />
          </div>
        </Field>
      </Section>

      <Section title="โดเมนและ SEO">
        <Field label="โดเมนหลัก" inline>
          <Input className="w-64" defaultValue="csexhibition.com" />
        </Field>
        <Field label="ชื่อเว็บไซต์ (SEO)">
          <Input defaultValue="CS Exhibition — บูธอีเวนต์ในศูนย์การค้า" />
        </Field>
        <Field label="คำอธิบาย (Meta description)">
          <Textarea
            rows={2}
            defaultValue="ระบบบริหารพื้นที่บูธและอีเวนต์ในศูนย์การค้าทั่วไทย"
          />
        </Field>
      </Section>
    </>
  );
}

function PaymentTab() {
  return (
    <>
      <Section title="ช่องทางการชำระเงิน">
        <PaymentRow
          icon={CreditCard}
          name="บัตรเครดิต / เดบิต"
          desc="Stripe / 2C2P"
          enabled
        />
        <PaymentRow icon={Globe} name="พร้อมเพย์ (QR)" desc="พร้อมเพย์เลขประจำตัวผู้เสียภาษี" enabled />
        <PaymentRow icon={Building} name="โอนเงินผ่านธนาคาร" desc="ตรวจสอบสลิปด้วยตัวเอง" enabled />
        <PaymentRow icon={CreditCard} name="TrueMoney Wallet" desc="ยังไม่เปิดใช้งาน" />
      </Section>

      <Section title="โครงสร้างราคา">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ค่าบริการ (%)">
            <Input type="number" defaultValue="10" />
          </Field>
          <Field label="เงินมัดจำเริ่มต้น (%)">
            <Input type="number" defaultValue="20" />
          </Field>
          <Field label="VAT (%)">
            <Input type="number" defaultValue="7" />
          </Field>
        </div>
      </Section>
    </>
  );
}

function PaymentRow({
  icon: Icon,
  name,
  desc,
  enabled,
}: {
  icon: React.ElementType;
  name: string;
  desc: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-card text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Toggle defaultChecked={enabled} />
    </div>
  );
}

function NotificationsTab() {
  return (
    <>
      <Section title="ช่องทางแจ้งเตือน" subtitle="ระบบจะส่งแจ้งเตือนผ่านช่องทางที่เปิดใช้">
        <NotifyRow icon={Mail} title="อีเมล" desc="ส่งสรุปและแจ้งเตือนสำคัญทุกวัน" defaultChecked />
        <NotifyRow icon={Bell} title="แจ้งเตือนในระบบ" desc="แสดงในกระดิ่งบน Topbar" defaultChecked />
        <NotifyRow icon={Globe} title="LINE Notify" desc="ส่งไปยังกลุ่ม LINE ของทีม" />
      </Section>

      <Section title="ประเภทเหตุการณ์">
        <Field label="มีการจองใหม่" inline>
          <Toggle defaultChecked />
        </Field>
        <Field label="การจองรอตรวจสอบเอกสาร" inline>
          <Toggle defaultChecked />
        </Field>
        <Field label="ใกล้หมดสัญญาเช่า (7 วัน)" inline>
          <Toggle defaultChecked />
        </Field>
        <Field label="สรุปยอดรายวัน" inline>
          <Toggle />
        </Field>
      </Section>
    </>
  );
}

function NotifyRow({
  icon: Icon,
  title,
  desc,
  defaultChecked,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-card text-info">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}

function SecurityTab() {
  return (
    <>
      <Section title="การยืนยันตัวตน">
        <Field
          label="บังคับ 2FA สำหรับ Admin"
          hint="ผู้ดูแลทุกคนต้องตั้ง OTP/Authenticator"
          inline
        >
          <Toggle defaultChecked />
        </Field>
        <Field label="ระยะเวลา Session (นาที)" inline>
          <Input type="number" defaultValue="60" className="w-24" />
        </Field>
        <Field label="ล็อกบัญชีหลังพยายามล้มเหลว" hint="ครั้ง" inline>
          <Input type="number" defaultValue="5" className="w-20" />
        </Field>
      </Section>

      <Section title="นโยบายรหัสผ่าน">
        <Field label="ความยาวขั้นต่ำ" inline>
          <Input type="number" defaultValue="10" className="w-20" />
        </Field>
        <Field label="ต้องมีตัวอักษรพิเศษ" inline>
          <Toggle defaultChecked />
        </Field>
        <Field label="ต้องเปลี่ยนทุก 90 วัน" inline>
          <Toggle />
        </Field>
      </Section>

      <Section title="โซน Danger" subtitle="การกระทำในส่วนนี้มีผลถาวร">
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-danger">
            <Lock className="h-4 w-4" />
            ปิดระบบรับการจองชั่วคราว
          </p>
          <p className="mt-1 text-xs text-foreground/70">
            ผู้ใช้จะไม่สามารถจองบูธใหม่ได้จนกว่าจะเปิดใหม่
          </p>
          <Button variant="danger" size="sm" className="mt-3">
            ปิดระบบรับการจอง
          </Button>
        </div>
      </Section>
    </>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
