"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { RevenueChart } from "@/components/admin/RevenueChart";
import type { RevenuePoint, ZoneBreakdownRow } from "@/lib/api/admin-server";
import type { ApiBooking } from "@/lib/api/bookings";
import { formatTHB, formatThaiDate } from "@/lib/pricing";

type Period = "week" | "month" | "quarter" | "year";

export function RevenueReport({
  initialPeriod,
  trend,
  zones,
  transactions,
}: {
  initialPeriod: Period;
  trend: RevenuePoint[];
  zones: ZoneBreakdownRow[];
  transactions: ApiBooking[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [period, setPeriod] = useState<Period>(initialPeriod);

  // Persist the period in the URL so navigation/refresh keeps the view stable.
  // Server component reads ?period= and re-fetches the analytics on the next
  // request.
  const setPeriodAndNav = (next: Period) => {
    setPeriod(next);
    const sp = new URLSearchParams(params.toString());
    sp.set("period", next);
    startTransition(() => router.push(`?${sp.toString()}`));
  };

  const totalRevenue = trend.reduce((s, p) => s + p.revenue, 0);
  const totalBookings = trend.reduce((s, p) => s + p.bookings, 0);
  const fee = totalRevenue * 0.1;
  const vat = totalRevenue * 0.07;
  const net = totalRevenue - fee - vat;
  const totalShareBase = zones.reduce((s, z) => s + z.revenue, 0) || 1;

  const handleExportCSV = () => {
    const header = "label,revenue,bookings";
    const lines = trend.map(
      (p) => `${csvEscape(p.label)},${p.revenue},${p.bookings}`,
    );
    const csv = [header, ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-${period}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="no-print mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto_auto_auto]">
        <Select
          value={period}
          onChange={(e) => setPeriodAndNav(e.target.value as Period)}
          disabled={pending}
        >
          <option value="week">7 วันล่าสุด</option>
          <option value="month">4 สัปดาห์ล่าสุด</option>
          <option value="quarter">6 เดือนล่าสุด</option>
          <option value="year">4 ไตรมาส</option>
        </Select>
        <Select disabled>
          <option>ทุกสาขา</option>
        </Select>
        <Select disabled>
          <option>ทุกหมวดหมู่</option>
        </Select>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          พิมพ์
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4" />
          CSV
        </Button>
        <Button onClick={() => window.print()}>
          <FileText className="h-4 w-4" />
          PDF
        </Button>
      </section>

      {/* Print styles — hide UI chrome, expand chart area, force white bg. */}
      <style jsx global>{`
        @media print {
          aside,
          header > div:last-child,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          body {
            background: #ffffff !important;
          }
          .rounded-xl,
          .rounded-lg {
            border-radius: 4px !important;
          }
        }
      `}</style>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="รายได้รวม" value={formatTHB(totalRevenue)} delta="—" />
        <StatBox label="ค่าธรรมเนียมบริการ" value={formatTHB(fee)} delta="—" />
        <StatBox label="ภาษีมูลค่าเพิ่ม" value={formatTHB(vat)} delta="—" />
        <StatBox
          label="รายได้สุทธิ"
          value={formatTHB(net)}
          delta="—"
          tone="primary"
        />
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">แนวโน้มรายได้</h2>
            <p className="text-xs text-muted-foreground">
              {totalBookings} การจองที่อนุมัติในช่วง{periodLabel(period)}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            ดาวน์โหลด CSV
          </Button>
        </header>
        <RevenueChart
          data={
            trend.length > 0
              ? trend
              : [{ label: "ยังไม่มีข้อมูล", revenue: 0, bookings: 0 }]
          }
        />
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">รายได้ตามโซน</h2>
        {zones.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีรายได้จากโซนใด
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">โซน</th>
                  <th className="px-3 py-2.5 text-right">บูธ</th>
                  <th className="px-3 py-2.5 text-right">Occupancy</th>
                  <th className="px-3 py-2.5 text-right">การจอง</th>
                  <th className="px-3 py-2.5 text-right">รายได้</th>
                  <th className="px-3 py-2.5 text-right">สัดส่วน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {zones.map((z) => {
                  const share = (z.revenue / totalShareBase) * 100;
                  return (
                    <tr key={z.zone} className="hover:bg-muted/40">
                      <td className="px-3 py-3 font-medium">{z.zone}</td>
                      <td className="px-3 py-3 text-right">{z.totalBooths}</td>
                      <td className="px-3 py-3 text-right">
                        {z.occupancyPct.toFixed(0)}%
                      </td>
                      <td className="px-3 py-3 text-right">{z.bookings}</td>
                      <td className="px-3 py-3 text-right font-semibold text-primary">
                        {formatTHB(z.revenue)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${share.toFixed(1)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs">
                            {share.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">รายการธุรกรรมล่าสุด</h2>
          <Link
            href="/admin/bookings"
            className="text-xs text-primary hover:underline"
          >
            ดูทั้งหมด →
          </Link>
        </header>
        {transactions.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีธุรกรรม
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">วันที่</th>
                  <th className="px-3 py-2.5">รหัสจอง</th>
                  <th className="px-3 py-2.5">อีเวนต์</th>
                  <th className="px-3 py-2.5">ลูกค้า</th>
                  <th className="px-3 py-2.5">สถานะ</th>
                  <th className="px-3 py-2.5 text-right">ยอด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.code} className="hover:bg-muted/40">
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatThaiDate(t.createdAt.slice(0, 10))}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{t.code}</td>
                    <td className="px-3 py-3">{t.eventNameTh}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {t.fullName}
                    </td>
                    <td className="px-3 py-3">
                      <BookingStatusPill status={t.status} />
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">
                      {formatTHB(t.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function StatBox({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "default" | "primary";
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        tone === "primary"
          ? "border-primary/40 bg-primary-soft"
          : "border-border bg-card"
      }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {delta !== "—" && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
          <ArrowUpRight className="h-3 w-3" />
          {delta}
        </p>
      )}
    </div>
  );
}

function periodLabel(p: Period): string {
  switch (p) {
    case "week":
      return " 7 วันล่าสุด";
    case "month":
      return " 4 สัปดาห์ล่าสุด";
    case "quarter":
      return " 6 เดือนล่าสุด";
    case "year":
      return " 4 ไตรมาสล่าสุด";
  }
}

function csvEscape(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
