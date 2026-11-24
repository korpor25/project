"use client";

import {
  BarChart3,
  CalendarDays,
  FileText,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  Link as LinkIcon,
  Map,
  Megaphone,
  Share2,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { EventStatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/utils";
import { coverStyle } from "@/lib/eventCover";
import { formatThaiDate, formatTHB } from "@/lib/pricing";
import type { EventSummary } from "@/types/domain";

type TabKey =
  | "overview"
  | "details"
  | "floorplan"
  | "booths"
  | "bookings"
  | "finance"
  | "promo";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "ภาพรวม", icon: BarChart3 },
  { key: "details",  label: "รายละเอียด", icon: FileText },
  { key: "floorplan", label: "ผังพื้นที่", icon: Map },
  { key: "booths",   label: "บูธ", icon: Store },
  { key: "bookings", label: "การจอง", icon: CalendarDays },
  { key: "finance",  label: "การเงิน", icon: Wallet },
  { key: "promo",    label: "โปรโมชัน", icon: Megaphone },
];

export function EventDetailTabs({ event }: { event: EventSummary }) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/6]" style={coverStyle(event)} aria-hidden>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
          <p className="text-xs uppercase opacity-80">{event.branch} • {event.province}</p>
          <p className="text-2xl font-bold leading-tight">{event.nameTh}</p>
          <p className="text-xs opacity-90">{formatThaiDate(event.startDate)} – {formatThaiDate(event.endDate)}</p>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <EventStatusPill status={event.status} />
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-border bg-muted/20 px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-card text-primary-hover shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="p-5">
        {tab === "overview" && <OverviewTab event={event} />}
        {tab === "details" && <DetailsTab event={event} />}
        {tab === "floorplan" && <PlaceholderTab title="ผังพื้นที่" hint="แสดง Interactive Floorplan + สถิติแต่ละโซน + รูปสถานที่" />}
        {tab === "booths" && <BoothsTab event={event} />}
        {tab === "bookings" && <PlaceholderTab title="การจอง" hint="ตารางการจองเฉพาะอีเวนต์นี้ + filter ตามสถานะ" />}
        {tab === "finance" && <FinanceTab event={event} />}
        {tab === "promo" && <PromoTab />}
      </div>
    </article>
  );
}

function OverviewTab({ event }: { event: EventSummary }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">ข้อมูลพื้นฐาน</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Row label="ชื่อ Event" value={event.nameTh} />
            <Row label="ประเภท" value={event.category} />
            <Row label="วันที่จัดงาน" value={`${formatThaiDate(event.startDate, "long")} – ${formatThaiDate(event.endDate, "long")}`} />
            <Row label="สถานที่" value={`${event.branch}, ${event.province}`} />
            <Row label="ผู้จัด" value="CS Exhibition Co., Ltd." />
            <Row label="ติดต่อ" value="02 279 2884" />
          </dl>
        </section>

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">สรุปการจอง</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="บูธทั้งหมด" value={event.totalBooths} />
            <Stat label="จองแล้ว" value={event.totalBooths - event.remainingBooths} tone="text-success" />
            <Stat label="รายได้" value={formatTHB((event.totalBooths - event.remainingBooths) * event.startingPrice)} small />
            <Stat label="คนเดิน" value="25,000" />
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success"
              style={{
                width: `${Math.round(((event.totalBooths - event.remainingBooths) / event.totalBooths) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {Math.round(((event.totalBooths - event.remainingBooths) / event.totalBooths) * 100)}%
            </span>{" "}
            ของบูธจองแล้ว
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">ไฮไลต์งาน</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✓ คนเดิน 5,000+/วัน</li>
              <li>✓ โซนขายดี Food</li>
              <li>✓ ใกล้ Starbucks, B2S, Watsons</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-success-soft p-4">
            <div className="flex items-center gap-2 font-medium text-success">
              <TrendingUp className="h-4 w-4" />
              AI Insight
            </div>
            <p className="mt-1 text-xs text-foreground/80">
              อัตราจองสูงกว่าค่าเฉลี่ย 12% ในช่วงเดียวกันปีก่อน แนะนำเพิ่มราคา Zone Food ขึ้น 8%
            </p>
          </div>
        </section>
      </div>

      <aside className="space-y-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">ช่องทางโปรโมต</p>
          <ul className="mt-2 flex gap-2 text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <ImageIcon className="h-4 w-4" />
            <LinkIcon className="h-4 w-4" />
            <Hash className="h-4 w-4" />
          </ul>
          <p className="mt-2 text-xs">#lifestylepopup2026</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">เอกสาร</p>
          <ul className="mt-2 space-y-1.5 text-xs">
            <li>📄 รายละเอียดอีเวนต์ (PDF)</li>
            <li>📄 เงื่อนไขการเช่า (PDF)</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function DetailsTab({ event }: { event: EventSummary }) {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">คำอธิบาย</p>
        <p className="mt-2 leading-relaxed">
          {event.nameTh} คือ Pop-up Market รวมร้านค้าไลฟ์สไตล์กว่า {event.totalBooths} ร้านบน Central Court ของ {event.branch}
          จัดวันที่ {formatThaiDate(event.startDate)} ถึง {formatThaiDate(event.endDate)} เปิด 10:00 – 22:00 น.
        </p>
      </section>
      <section>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">เงื่อนไขเพิ่มเติม</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>เปิดร้านตลอดระยะเวลางาน</li>
          <li>ต้องติดตั้งร้านก่อนงาน 1 วัน</li>
          <li>ห้ามแบ่งพื้นที่ให้ผู้อื่นใช้งาน</li>
        </ul>
      </section>
      <section>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">ประเภทสินค้าที่ไม่อนุญาต</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["แอลกอฮอล์", "บุหรี่", "ลอตเตอรี่", "อาหารสด", "ยา"].map((t) => (
            <Badge key={t} tone="danger">🚫 {t}</Badge>
          ))}
        </div>
      </section>
    </div>
  );
}

function BoothsTab({ event }: { event: EventSummary }) {
  return (
    <div>
      <p className="mb-3 text-sm">
        <span className="font-semibold">{event.totalBooths}</span> บูธในอีเวนต์นี้
      </p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {Array.from({ length: event.totalBooths }).map((_, i) => {
          const tone = i < event.totalBooths - event.remainingBooths ? "bg-success/70" : "bg-muted";
          return <span key={i} className={`aspect-square rounded ${tone}`} aria-hidden />;
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <Badge tone="success" className="mr-2">●</Badge>จองแล้ว
        <Badge tone="neutral" className="ml-2">●</Badge>ว่าง
      </p>
    </div>
  );
}

function FinanceTab({ event }: { event: EventSummary }) {
  const totalRevenue = (event.totalBooths - event.remainingBooths) * event.startingPrice;
  const paid = totalRevenue * 0.78;
  const pending = totalRevenue - paid;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <FinanceTile label="รายได้รวม" value={totalRevenue} tone="text-primary" />
      <FinanceTile label="ชำระแล้ว" value={paid} tone="text-success" />
      <FinanceTile label="รออนุมัติ" value={pending} tone="text-warning" />
    </div>
  );
}

function FinanceTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{formatTHB(value)}</p>
    </div>
  );
}

function PromoTab() {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">โซเชียลมีเดีย</p>
        <ul className="mt-2 space-y-1">
          <li>📘 facebook.com/csexhibition</li>
          <li>📷 instagram.com/csexhibition</li>
          <li>🐦 twitter.com/csexhibition</li>
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Hashtag แคมเปญ</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["#csexhibition", "#popup2026", "#lifestylethailand"].map((t) => (
            <Badge key={t} tone="primary">{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <LayoutGrid className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">แท็บ &quot;{title}&quot;</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function Stat({ label, value, tone = "text-foreground", small }: { label: string; value: number | string; tone?: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3 text-center">
      <p className={cn("font-bold leading-tight", tone, small ? "text-sm" : "text-xl")}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
