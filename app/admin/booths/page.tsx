import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { BoothStatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchEvents, fetchEventBooths } from "@/lib/api/events";
import { formatTHB } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminBoothsPage() {
  const events = await fetchEvents();
  // Fan-out: fetch booths for each event in parallel so we can paint a per-
  // event card with real counts + status breakdown.
  const boothsByEvent = await Promise.all(
    events.map((e) => fetchEventBooths(e.slug)),
  );

  const totalBooths = boothsByEvent.reduce((s, list) => s + list.length, 0);
  const reserved = boothsByEvent.reduce(
    (s, list) =>
      s + list.filter((b) => b.status === "RESERVED" || b.status === "LOCKED").length,
    0,
  );

  return (
    <>
      <AdminTopbar
        title="จัดการบูธ"
        subtitle="ภาพรวมบูธทุก Event พร้อมสถานะแบบเรียลไทม์"
      />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input placeholder="ค้นหาบูธ, อีเวนต์..." className="pl-10" />
          </div>
          <Link href="/admin/events">
            <Button>
              <Plus className="h-4 w-4" />
              ไปจัดการอีเวนต์
            </Button>
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="บูธทั้งหมด" value={totalBooths} />
          <StatCard label="ว่าง" value={totalBooths - reserved} tone="text-success" />
          <StatCard label="จองแล้ว" value={reserved} tone="text-primary" />
          <StatCard
            label="อัตราการใช้"
            value={`${totalBooths > 0 ? Math.round((reserved / totalBooths) * 100) : 0}%`}
          />
        </section>

        <section className="space-y-4">
          {events.map((e, idx) => {
            const booths = boothsByEvent[idx];
            const counts = {
              available: booths.filter((b) => b.status === "AVAILABLE").length,
              locked: booths.filter((b) => b.status === "LOCKED").length,
              reserved: booths.filter((b) => b.status === "RESERVED").length,
              suspended: booths.filter((b) => b.status === "SUSPENDED").length,
            };
            const totalRevenue = booths
              .filter((b) => b.status === "RESERVED")
              .reduce((s, b) => s + b.price, 0);

            return (
              <article
                key={e.id}
                className="rounded-xl border border-border bg-card shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold">{e.nameTh}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.branch} • {booths.length} บูธ • รายได้ที่จอง{" "}
                      {formatTHB(totalRevenue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Tally
                      label="ว่าง"
                      count={counts.available}
                      tone="text-success"
                    />
                    <Tally
                      label="กำลังเลือก"
                      count={counts.locked}
                      tone="text-warning"
                    />
                    <Tally
                      label="จอง"
                      count={counts.reserved}
                      tone="text-primary"
                    />
                    {counts.suspended > 0 && (
                      <Tally
                        label="ระงับ"
                        count={counts.suspended}
                        tone="text-danger"
                      />
                    )}
                    <Link href={`/admin/events/${e.id}/edit#event-booths`}>
                      <Button size="sm" variant="outline">
                        <Pencil className="h-3.5 w-3.5" />
                        แก้ไขบูธ
                      </Button>
                    </Link>
                  </div>
                </header>

                {booths.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    ยังไม่มีบูธในอีเวนต์นี้
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2.5">รหัส</th>
                          <th className="px-4 py-2.5 text-right">ราคา</th>
                          <th className="px-4 py-2.5">สถานะ</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {booths.map((b) => (
                          <tr key={b.id} className="hover:bg-muted/30">
                            <td className="px-4 py-2.5 font-mono text-xs font-semibold">
                              {b.code}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-primary">
                              {formatTHB(b.price)}
                            </td>
                            <td className="px-4 py-2.5">
                              <BoothStatusPill status={b.status} paid={b.paid} />
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <Link
                                href={`/admin/events/${e.id}/edit#event-booths`}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                แก้ไข
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>
        {typeof value === "number" ? value.toLocaleString("th-TH") : value}
      </p>
    </div>
  );
}

function Tally({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${tone}`}>
      <span className="font-bold">{count}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

