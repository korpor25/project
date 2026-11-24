import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { DonutChart } from "@/components/admin/DonutChart";
import { KpiCard } from "@/components/admin/KpiCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Select } from "@/components/ui/Select";
import {
  fetchDashboard,
  fetchRevenueTrend,
  fetchZoneBreakdown,
} from "@/lib/api/admin-server";
import { fetchAdminBookings } from "@/lib/api/bookings-server";
import { formatTHB, formatThaiDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Static colour palette for the zone donut — keyed by zone name with a fallback.
const ZONE_COLORS: Record<string, string> = {
  Fashion: "#c9a24a",
  Food: "#2f6cb2",
  Beauty: "#2e9d63",
  Lifestyle: "#d4900e",
  Tech: "#c93737",
  "Street Food": "#c93737",
  Beverage: "#2f6cb2",
  Dessert: "#d4900e",
};
const FALLBACK_COLOR = "#7a4ec3";

type Period = "week" | "month" | "quarter" | "year";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period: Period =
    sp.period === "month" || sp.period === "quarter" || sp.period === "year"
      ? sp.period
      : "week";
  const [kpi, recentRes, revenueData, zones] = await Promise.all([
    fetchDashboard(),
    fetchAdminBookings({ perPage: 5 }),
    fetchRevenueTrend(period),
    fetchZoneBreakdown(),
  ]);
  const recent = recentRes.rows;
  // Zone donut shows revenue share. If no approved bookings yet, fall back to
  // booth count so the donut isn't empty in fresh installs.
  const totalRevenue = zones.reduce((s, z) => s + z.revenue, 0);
  const donutSource =
    totalRevenue > 0
      ? zones.map((z) => ({ label: z.zone, value: z.revenue }))
      : zones.map((z) => ({ label: z.zone, value: z.totalBooths }));
  const donutTotal = donutSource.reduce((s, d) => s + d.value, 0) || 1;
  const ZONE_DONUT = donutSource.map((d) => ({
    label: d.label,
    value: d.value,
    color: ZONE_COLORS[d.label] ?? FALLBACK_COLOR,
  }));
  const todos: Array<{
    label: string;
    count: number;
    icon: typeof ClipboardCheck;
    tone: string;
    href: string;
  }> = [
    {
      label: "รออนุมัติ",
      count: kpi.pending,
      icon: ClipboardCheck,
      tone: "text-warning",
      href: "/admin/bookings?status=PENDING",
    },
    {
      label: "อนุมัติแล้ว",
      count: kpi.approved,
      icon: ClipboardCheck,
      tone: "text-success",
      href: "/admin/bookings?status=APPROVED",
    },
    {
      label: "ผู้ใช้ทั้งหมด",
      count: kpi.totalUsers,
      icon: Users,
      tone: "text-info",
      href: "/admin/users",
    },
    {
      label: "บูธว่าง",
      count: kpi.available,
      icon: CalendarDays,
      tone: "text-primary-hover",
      href: "/admin/booths",
    },
    {
      label: "บูธทั้งหมด",
      count: kpi.totalBooths,
      icon: AlertTriangle,
      tone: "text-danger",
      href: "/admin/booths",
    },
  ];

  const monthRevenueLabel = formatCompactTHB(kpi.monthRevenue);
  const occupancyLabel = `${kpi.occupancyPct.toFixed(0)}%`;

  return (
    <>
      <AdminTopbar title="สวัสดี, Admin CS" subtitle="วันพุธที่ 15 พฤษภาคม 2569" />
      <main className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
        <FilterRow />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="รายได้รวม (เดือนนี้)"
            value={monthRevenueLabel}
            deltaPct={0}
            iconBg="bg-primary-soft"
            icon={<CircleDollarSign className="h-5 w-5" />}
            spark={[8, 9, 7, 12, 10, 14, 13, 16, 15, 18, 19, 22]}
          />
          <KpiCard
            label="ยอดจองใหม่ (เดือนนี้)"
            value={kpi.newBookings.toLocaleString("th-TH")}
            deltaPct={0}
            iconBg="bg-info-soft"
            icon={<ClipboardCheck className="h-5 w-5 text-info" />}
            spark={[4, 5, 6, 5, 8, 7, 9, 10, 12, 11, 13, 15]}
          />
          <KpiCard
            label="อัตราการใช้พื้นที่"
            value={occupancyLabel}
            deltaPct={0}
            iconBg="bg-success-soft"
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            spark={[60, 62, 65, 64, 67, 70, 68, 71, 70, 72, 71, 73]}
          />
          <KpiCard
            label="ผู้ใช้ทั้งหมด"
            value={kpi.totalUsers.toLocaleString("th-TH")}
            deltaPct={0}
            iconBg="bg-warning-soft"
            icon={<Users className="h-5 w-5 text-warning" />}
            spark={[20, 22, 21, 24, 25, 23, 27, 28, 27, 29, 30, 31]}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardCard title="สิ่งที่ต้องทำวันนี้" subtitle={`${todos.length} รายการ`}>
            <ul className="divide-y divide-border">
              {todos.map((t) => (
                <li key={t.label}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between rounded-md py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted ${t.tone}`}
                      >
                        <t.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{t.label}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="font-bold">{t.count}</span>
                      <span className="text-muted-foreground">รายการ</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="แจ้งเตือนล่าสุด" link={{ label: "ดูทั้งหมด →", href: "/admin/audit" }}>
            <ul className="space-y-3 text-sm">
              <NoticeItem
                tone="bg-info-soft text-info"
                label={`รออนุมัติ ${kpi.pending} รายการ`}
                detail="ตรวจสอบสลิปและเอกสารของลูกค้า"
                meta="—"
              />
              <NoticeItem
                tone="bg-success-soft text-success"
                label={`อนุมัติแล้ว ${kpi.approved} รายการ`}
                detail="เดือนนี้"
                meta="—"
              />
              <NoticeItem
                tone="bg-warning-soft text-warning"
                label={`บูธว่าง ${kpi.available} / ${kpi.totalBooths}`}
                detail={`อัตราการใช้พื้นที่ ${kpi.occupancyPct.toFixed(0)}%`}
                meta="—"
              />
            </ul>
          </DashboardCard>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <DashboardCard
            title={`รายได้${periodTitle(period)}`}
            action={
              <div className="flex flex-wrap gap-1">
                <PillToggle label="7 วัน" period="week" current={period} />
                <PillToggle label="4 สัปดาห์" period="month" current={period} />
                <PillToggle label="6 เดือน" period="quarter" current={period} />
                <PillToggle label="รายปี" period="year" current={period} />
              </div>
            }
          >
            <RevenueChart
              data={
                revenueData.length > 0
                  ? revenueData
                  : [{ label: "ยังไม่มีข้อมูล", revenue: 0, bookings: 0 }]
              }
            />
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <LegendDot color="bg-primary" /> รายได้
              <LegendDot color="bg-foreground" /> จำนวนการจอง
            </div>
          </DashboardCard>

          <DashboardCard
            title={totalRevenue > 0 ? "สัดส่วนรายได้ตามโซน" : "สัดส่วนบูธตามโซน"}
          >
            <DonutChart
              segments={ZONE_DONUT}
              centerLabel="รวม"
              centerValue={String(donutTotal)}
            />
          </DashboardCard>
        </section>

        <DashboardCard title="การจองล่าสุด" link={{ label: "ดูทั้งหมด →", href: "/admin/bookings" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">บูธ / โซน</th>
                  <th className="px-3 py-2.5">ผู้จอง</th>
                  <th className="px-3 py-2.5">วันที่จอง</th>
                  <th className="px-3 py-2.5 text-right">ยอด</th>
                  <th className="px-3 py-2.5">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      ยังไม่มีการจองในระบบ
                    </td>
                  </tr>
                ) : (
                  recent.map((b) => (
                    <tr key={b.code} className="hover:bg-muted/30">
                      <td className="px-3 py-3">
                        <p className="font-medium">{b.boothCode}</p>
                        <p className="text-xs text-muted-foreground">Zone {b.zoneName ?? "—"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{b.fullName}</p>
                        <p className="text-xs text-muted-foreground">{b.companyName ?? "-"}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {formatThaiDate(b.createdAt.slice(0, 10))}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-primary">
                        {formatTHB(b.grandTotal)}
                      </td>
                      <td className="px-3 py-3">
                        <BookingStatusPill status={b.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCard title="Occupancy ตามโซน">
            <div className="grid grid-cols-3 gap-2">
              {(["A", "B", "C"] as const).map((z, i) => (
                <div
                  key={z}
                  className={`rounded-lg p-3 text-xs ${
                    ["bg-success/15", "bg-warning/15", "bg-danger/15"][i]
                  }`}
                >
                  <p className={`font-bold ${["text-success", "text-warning", "text-danger"][i]}`}>
                    ZONE {z}
                  </p>
                  <p className="text-xl font-bold">{[82, 65, 38][i]}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    {["จองเต็ม", "เริ่มดี", "ต้องโปรโมต"][i]}
                  </p>
                </div>
              ))}
            </div>
            <MiniHeatmap />
          </DashboardCard>

          <DashboardCard title="ข้อมูลลูกค้า (Insights)">
            <ul className="space-y-3 text-sm">
              <Stat label="ลูกค้าใหม่/เดือน" value="24" sub="↑ 12% จากเดือนก่อน" tone="text-info" />
              <Stat label="อัตราจองซ้ำ" value="60%" sub="ลูกค้าจองมากกว่า 1 ครั้ง" tone="text-success" />
              <Stat label="คะแนนพึงพอใจ" value="4.6 / 5" sub="จากรีวิว 248 ราย" tone="text-warning" />
            </ul>
          </DashboardCard>

          <DashboardCard title="เป้าหมายรายได้">
            <p className="text-sm text-muted-foreground">เป้าหมายปีนี้</p>
            <p className="mt-1 text-2xl font-bold">฿1.80M</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "75%" }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              ทำได้แล้ว <span className="font-semibold text-foreground">75%</span> ของเป้าหมาย
            </p>
            <div className="mt-4 grid grid-cols-6 gap-1">
              {[40, 55, 65, 60, 72, 80].map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span
                    className="w-3 rounded bg-primary/80"
                    style={{ height: `${p / 1.5}px` }}
                    aria-hidden
                  />
                  <span className="text-[9px] text-muted-foreground">Q{i + 1}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </section>
      </main>
    </>
  );
}

function FilterRow() {
  return (
    <section className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto_auto]">
      <Select>
        <option>พฤษภาคม 2569</option>
        <option>เมษายน 2569</option>
      </Select>
      <Select><option>ภาคทั้งหมด</option></Select>
      <Select><option>จังหวัดทั้งหมด</option></Select>
      <Select><option>ห้าง / สาขา</option></Select>
      <Select><option>Event ทั้งหมด</option></Select>
      <Button variant="outline">ล้างค่า</Button>
      <Button>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </section>
  );
}

function DashboardCard({
  title,
  subtitle,
  action,
  link,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  link?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action ??
          (link && (
            <Link href={link.href} className="text-xs text-primary hover:underline">
              {link.label}
            </Link>
          ))}
      </header>
      {children}
    </article>
  );
}

function PillToggle({
  label,
  period,
  current,
}: {
  label: string;
  period: Period;
  current: Period;
}) {
  const active = period === current;
  return (
    <Link
      href={`/admin/dashboard?period=${period}`}
      scroll={false}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </Link>
  );
}

function periodTitle(p: Period): string {
  switch (p) {
    case "week":
      return "รายวัน (7 วันล่าสุด)";
    case "month":
      return "รายสัปดาห์ (4 สัปดาห์ล่าสุด)";
    case "quarter":
      return "รายเดือน (6 เดือนล่าสุด)";
    case "year":
      return "รายไตรมาส (1 ปีล่าสุด)";
  }
}

function LegendDot({ color }: { color: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`} aria-hidden />;
}

function NoticeItem({ tone, label, detail, meta }: { tone: string; label: string; detail: string; meta: string }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Briefcase className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="text-[10px] text-muted-foreground">{meta}</span>
    </li>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <li className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <p className={`text-xs font-medium ${tone}`}>{sub}</p>
    </li>
  );
}

function formatCompactTHB(n: number): string {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `฿${(n / 1_000).toFixed(1)}K`;
  return `฿${n.toLocaleString("th-TH")}`;
}

function MiniHeatmap() {
  return (
    <div className="mt-3 grid grid-cols-12 gap-0.5">
      {Array.from({ length: 60 }).map((_, i) => {
        const tone = i % 7 === 0
          ? "bg-danger/40"
          : i % 5 === 0
            ? "bg-warning/40"
            : "bg-success/40";
        return <span key={i} className={`aspect-square rounded-sm ${tone}`} aria-hidden />;
      })}
    </div>
  );
}
