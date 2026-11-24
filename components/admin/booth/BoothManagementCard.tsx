import { Calendar, Edit2, MapPin, Upload } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { coverStyle } from "@/lib/eventCover";
import { formatTHB } from "@/lib/pricing";
import type { EventSummary } from "@/types/domain";

const STATUS = {
  OPEN:      { label: "กำลังเปิดจอง",   tone: "success" as const, ribbon: "bg-success" },
  UPCOMING:  { label: "ใกล้เริ่มงาน",   tone: "warning" as const, ribbon: "bg-warning" },
  DRAFT:     { label: "ยังไม่มีแผนผัง", tone: "neutral" as const, ribbon: "bg-muted-foreground" },
  CLOSED:    { label: "ปิดสมัคร",       tone: "danger" as const,  ribbon: "bg-danger" },
  CANCELLED: { label: "ยกเลิก",          tone: "danger" as const,  ribbon: "bg-danger" },
};

export function BoothManagementCard({
  event,
  total,
  reserved,
  revenue,
  hasFloorplan = true,
}: {
  event: EventSummary;
  total: number;
  reserved: number;
  revenue: number;
  hasFloorplan?: boolean;
}) {
  const meta = STATUS[event.status];
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/9]" style={coverStyle(event)} aria-hidden>
        <div className="absolute left-3 top-3">
          <Badge tone={meta.tone} className="rounded-md">
            <span className={`mr-1 inline-block h-2 w-2 rounded-full ${meta.ribbon}`} />
            {meta.label}
          </Badge>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-card/95 px-2 py-1 text-[10px] font-medium shadow">
          {hasFloorplan ? "✓ อัปโหลดแล้ว 3 ไฟล์" : "ยังไม่มีแผนผัง"}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {event.branch}
        </p>
        <p className="font-bold leading-tight">{event.nameTh}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {event.startDate} – {event.endDate}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-3 text-center sm:grid-cols-4">
          <Stat label="ทั้งหมด" value={total} />
          <Stat label="จองแล้ว" value={reserved} tone="text-success" />
          <Stat label="ว่าง" value={total - reserved} tone="text-primary-hover" />
          <Stat label="รายได้" value={`฿${(revenue / 1000).toFixed(0)}K`} tone="text-foreground" />
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="primary" className="flex-1">
            <Calendar className="h-3.5 w-3.5" />
            จัดการ
          </Button>
          <Button size="sm" variant="outline">
            <Edit2 className="h-3.5 w-3.5" />
            แก้ไข
          </Button>
          <Button size="sm" variant="outline" aria-label="อัปโหลดแผนผัง">
            <Upload className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, tone = "text-foreground" }: { label: string; value: number | string; tone?: string }) {
  return (
    <div>
      <p className={`text-base font-bold leading-tight ${tone}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function BoothStatusBoard({ branch, total }: { branch: string; total: number }) {
  // Color blocks representing each booth status — visual only, mirrors PDF p.25 footer.
  const cells = Array.from({ length: total });
  return (
    <div>
      <p className="text-sm font-semibold">{branch}</p>
      <p className="text-xs text-muted-foreground">{total} บูธ</p>
      <div className="mt-2 grid grid-cols-12 gap-0.5">
        {cells.map((_, i) => {
          const tone =
            i % 6 === 0 ? "bg-danger" :
            i % 5 === 0 ? "bg-warning" :
            i % 4 === 0 ? "bg-muted-foreground/30" :
            "bg-success";
          return (
            <span key={i} className={`aspect-square rounded-sm ${tone}`} aria-hidden />
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <Dot color="bg-success" /> ว่าง
        <Dot color="bg-warning" /> รออนุมัติ
        <Dot color="bg-danger" /> จองแล้ว
        <Dot color="bg-muted-foreground/30" /> ระงับ
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className={`inline-block h-2 w-2 rounded-sm ${color}`} aria-hidden />;
}

export function BoothActivityLog({ items }: { items: { actor: string; action: string; target: string; time: string }[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((a, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-hover text-[10px] font-semibold">
            {a.actor.split(" ")[1]?.[0] ?? a.actor[0]}
          </span>
          <div className="flex-1">
            <p>
              <span className="font-medium">{a.actor}</span>{" "}
              <span className="text-muted-foreground">{a.action}</span>{" "}
              <span className="font-medium">{a.target}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">{a.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function _legendIcon() {
  // unused placeholder export to keep tree-shaking happy in case helpers move
  return <MapPin />;
}
