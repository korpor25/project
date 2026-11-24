import Link from "next/link";
import { Copy, Download, Edit2, Plus } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { EventStatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { fetchEvents } from "@/lib/api/events";
import { formatThaiDate, formatTHB } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await fetchEvents();

  return (
    <>
      <AdminTopbar
        title="จัดการอีเวนต์"
        subtitle="แก้ไขสถานะการเผยแพร่ ราคา และเงื่อนไขของแต่ละอีเวนต์"
      />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/events/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              สร้างอีเวนต์ใหม่
            </Button>
          </Link>
        </div>

        <section className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          {events.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              ยังไม่มีอีเวนต์ — กดปุ่ม &quot;สร้างอีเวนต์ใหม่&quot; เพื่อเริ่มต้น
            </p>
          ) : (
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">อีเวนต์</th>
                  <th className="px-4 py-3">สาขา</th>
                  <th className="px-4 py-3">ระยะเวลา</th>
                  <th className="px-4 py-3 text-right">ราคาเริ่มต้น</th>
                  <th className="px-4 py-3 text-center">บูธ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.nameTh}</p>
                      <p className="text-xs text-muted-foreground">
                        /{e.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {e.branch}
                      <br />
                      <span className="text-xs">{e.province}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatThaiDate(e.startDate)} –{" "}
                      {formatThaiDate(e.endDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {formatTHB(e.startingPrice)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {e.remainingBooths} / {e.totalBooths}
                    </td>
                    <td className="px-4 py-3">
                      <EventStatusPill status={e.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/events/${e.slug}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline"
                        >
                          ดูหน้าลูกค้า ↗
                        </Link>
                        <Link
                          href={`/admin/events/new?from=${e.id}`}
                          title="ทำซ้ำอีเวนต์นี้ (คัดลอกโซนและบูธ)"
                        >
                          <Button variant="ghost" size="icon" aria-label="ทำซ้ำ">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${e.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="แก้ไข">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
 