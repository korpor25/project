"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Filter,
  Flame,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  listBranches,
  listZoneBreakdown,
  type AdminBranch,
  type ZoneBreakdownRow,
} from "@/lib/api/admin";
import { formatTHB } from "@/lib/pricing";

type ZoneStatus = "hot" | "warm" | "cold";

function zoneStatus(occupancyPct: number): ZoneStatus {
  if (occupancyPct >= 75) return "hot";
  if (occupancyPct >= 50) return "warm";
  return "cold";
}

const HEATMAP_GRID = Array.from({ length: 7 }).map((_, row) =>
  Array.from({ length: 12 }).map((_, col) => {
    const v = (Math.sin(row * 1.3 + col * 0.7) + 1) / 2;
    return Math.round(v * 100);
  }),
);

const INSIGHTS = [
  {
    icon: Flame,
    tone: "text-danger bg-danger-soft",
    title: "Hot zone: Fashion เต็มเร็วผิดปกติ",
    body: "ปริมาณการจอง Fashion ในสัปดาห์นี้สูงกว่าค่าเฉลี่ย 3 เดือนถึง +28% ควรพิจารณาเปิดบูธชั่วคราว 4-6 บูธ หรือขยับแม่แบบเข้าโซน Beauty ที่ติดกัน",
    action: "เพิ่มบูธชั่วคราว",
  },
  {
    icon: TrendingDown,
    tone: "text-warning bg-warning-soft",
    title: "Lifestyle ใช้งานต่ำต่อเนื่อง 4 สัปดาห์",
    body: "อัตราใช้งานลดลงจาก 68% → 42% ตั้งแต่กลางเดือนเมษายน เสนอให้ทำโปรโมชั่นรวมแพ็กเกจกับโซน Food หรือลดราคาช่วงวันธรรมดา",
    action: "สร้างโปรโมชั่น",
  },
  {
    icon: Lightbulb,
    tone: "text-info bg-info-soft",
    title: "ปรับราคา Beauty +5% มีโอกาสสูง",
    body: "ราคาเฉลี่ยของ Beauty ต่ำกว่าตลาด 8% ในขณะที่ occupancy อยู่ที่ 71% ระบบประเมินว่าการขึ้นราคา +5% จะทำให้รายได้เพิ่ม ~฿24K/เดือน โดยไม่กระทบ occupancy",
    action: "ทดลองปรับราคา",
  },
  {
    icon: Sparkles,
    tone: "text-success bg-success-soft",
    title: "Cross-sell: ลูกค้า Food มักจอง Beauty ภายใน 60 วัน",
    body: "32% ของผู้เช่าโซน Food กลับมาจอง Beauty ภายใน 2 เดือน ส่ง email/SMS แนะนำแพ็กเกจ Food + Beauty ก่อนสิ้นสุดสัญญา",
    action: "สร้างแคมเปญ",
  },
];

const AI_RECOMMEND = [
  "เพิ่ม inventory โซน Fashion ในสัปดาห์ที่ 23",
  "ขยับ Lifestyle ไปชั้น 2 — มี foot traffic จาก Beauty มากกว่า",
  "จัด workshop ดึงดูดในโซน Pet ช่วงสุดสัปดาห์",
  "ตั้งเป้า occupancy รวม Q3 ที่ 78% — ปัจจุบัน 64%",
];

export function ZoneAnalytics() {
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [period, setPeriod] = useState("month");
  // Rows are stored together with the branch they were fetched for, so
  // `loading` is derived instead of being set at the top of the effect (which
  // cascades an extra render pass on every branch change).
  const [result, setResult] = useState<{
    branchId: string;
    rows: ZoneBreakdownRow[];
  } | null>(null);
  const loading = result?.branchId !== branchId;
  const zones = result?.rows ?? [];

  useEffect(() => {
    listBranches().then((data) => {
      setBranches(data);
      setBranchId((prev) => prev || data[0]?.id || "");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Guards against out-of-order responses: switching branch A -> B -> A used
    // to let a slow reply for an abandoned branch overwrite the current rows.
    let cancelled = false;
    listZoneBreakdown(branchId || undefined)
      .then((rows) => {
        if (!cancelled) setResult({ branchId, rows });
      })
      .catch(() => {
        if (!cancelled) setResult({ branchId, rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const totalRevenue = zones.reduce((s, z) => s + z.revenue, 0);
  const totalBookings = zones.reduce((s, z) => s + z.bookings, 0);
  const avgOccupancy = zones.length
    ? Math.round(zones.reduce((s, z) => s + z.occupancyPct, 0) / zones.length)
    : 0;

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto_auto]">
        <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          {branches.length === 0 && <option value="">กำลังโหลด...</option>}
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select>
          <option>ทุกชั้น</option>
          <option>ชั้น G</option>
          <option>ชั้น 1</option>
          <option>ชั้น 2</option>
        </Select>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="week">7 วัน</option>
          <option value="month">30 วัน</option>
          <option value="quarter">ไตรมาส</option>
          <option value="year">รายปี</option>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          ตัวกรอง
        </Button>
        <Button>
          <Brain className="h-4 w-4" />
          ขอ Insight ใหม่
        </Button>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="รายได้รวม" value={formatTHB(totalRevenue)} delta="+12.4%" deltaTone="up" />
        <StatBox label="จำนวนการจอง" value={String(totalBookings)} delta="+8.1%" deltaTone="up" />
        <StatBox label="Occupancy เฉลี่ย" value={`${avgOccupancy}%`} delta="+2.3%" deltaTone="up" />
        <StatBox label="โซนที่ใช้งานต่ำ" value="2" delta="−1" deltaTone="down" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card title="Heatmap การใช้งานพื้นที่ — รายวัน" subtitle="เข้มกว่า = ความหนาแน่นสูงกว่า">
          <Heatmap />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>น้อย</span>
            <div className="flex h-3 flex-1 overflow-hidden rounded-sm">
              {[20, 35, 50, 65, 80, 95].map((p) => (
                <div
                  key={p}
                  className="flex-1"
                  style={{ background: heatColor(p) }}
                  aria-hidden
                />
              ))}
            </div>
            <span>มาก</span>
          </div>
        </Card>

        <Card title="อันดับโซน" subtitle="ตามอัตราการใช้งาน">
          {loading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : zones.length === 0 ? (
            <p className="text-sm text-muted-foreground">ไม่มีข้อมูลโซน</p>
          ) : (
            <ul className="space-y-3">
              {zones.map((z, i) => {
                const st = zoneStatus(z.occupancyPct);
                return (
                  <li key={z.zone}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {i + 1}
                        </span>
                        <span className="font-medium">{z.zone}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {z.occupancyPct}% • {formatTHB(z.revenue)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${z.occupancyPct}%`,
                          background:
                            st === "hot" ? "#c93737" : st === "warm" ? "#c9a24a" : "#5a8dd9",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <section className="mb-6">
        <Card title="ตารางสรุปแต่ละโซน">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">โซน</th>
                  <th className="px-3 py-2.5 text-right">บูธทั้งหมด</th>
                  <th className="px-3 py-2.5 text-right">ใช้งาน</th>
                  <th className="px-3 py-2.5 text-right">Occupancy</th>
                  <th className="px-3 py-2.5 text-right">รายได้</th>
                  <th className="px-3 py-2.5 text-right">การจอง</th>
                  <th className="px-3 py-2.5">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : zones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  zones.map((z) => (
                    <tr key={z.zone} className="hover:bg-muted/40">
                      <td className="px-3 py-3 font-medium">{z.zone}</td>
                      <td className="px-3 py-3 text-right">{z.totalBooths}</td>
                      <td className="px-3 py-3 text-right">{z.occupied}</td>
                      <td className="px-3 py-3 text-right">{z.occupancyPct}%</td>
                      <td className="px-3 py-3 text-right font-semibold text-primary">
                        {formatTHB(z.revenue)}
                      </td>
                      <td className="px-3 py-3 text-right">{z.bookings}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={zoneStatus(z.occupancyPct)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card
          title="AI Insights"
          subtitle="ระบบวิเคราะห์ข้อมูลย้อนหลัง 90 วันและให้คำแนะนำเชิงรุก"
          icon={Brain}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {INSIGHTS.map((it) => (
              <article
                key={it.title}
                className="rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${it.tone}`}
                  >
                    <it.icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{it.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{it.body}</p>
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      {it.action} →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="คำแนะนำสำหรับสัปดาห์นี้" icon={Lightbulb}>
          <ul className="space-y-2.5 text-sm">
            {AI_RECOMMEND.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-info/30 bg-info-soft p-3 text-xs">
            <p className="flex items-center gap-1.5 font-semibold text-info">
              <AlertCircle className="h-3.5 w-3.5" />
              อัปเดตเมื่อ 5 นาทีที่แล้ว
            </p>
            <p className="mt-1 text-foreground/80">
              AI วิเคราะห์ใหม่ทุก 4 ชม. หรือเมื่อมีการจองสำคัญ
            </p>
          </div>
        </Card>
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: ZoneStatus }) {
  const map = {
    hot: { label: "ร้อนแรง",  tone: "bg-danger-soft text-danger", icon: TrendingUp },
    warm: { label: "ปกติ",     tone: "bg-warning-soft text-warning", icon: TrendingUp },
    cold: { label: "ใช้งานต่ำ", tone: "bg-info-soft text-info", icon: TrendingDown },
  } as const;
  const { label, tone, icon: Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function StatBox({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p
        className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
          deltaTone === "up" ? "text-success" : "text-danger"
        }`}
      >
        {deltaTone === "up" ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {delta}
      </p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-3 flex items-start gap-3">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary-hover">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </header>
      {children}
    </article>
  );
}

function Heatmap() {
  const days = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
  return (
    <div className="flex">
      <div className="mr-1 flex flex-col gap-0.5 pt-4 text-[10px] text-muted-foreground">
        {days.map((d) => (
          <span key={d} className="flex h-5 items-center pr-1.5">
            {d}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex gap-0.5 text-[10px] text-muted-foreground">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="flex-1 text-center">
              W{i + 1}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {HEATMAP_GRID.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((v, c) => (
                <span
                  key={c}
                  className="aspect-square flex-1 rounded-[2px]"
                  style={{ background: heatColor(v) }}
                  title={`${v}%`}
                  aria-hidden
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function heatColor(v: number): string {
  // map 0..100 to gold gradient
  const alpha = 0.15 + (v / 100) * 0.85;
  return `rgba(201, 162, 74, ${alpha})`;
}
