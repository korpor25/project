import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  deltaPct,
  trend,
  iconBg = "bg-primary-soft",
  icon,
  spark,
}: {
  label: string;
  value: string;
  deltaPct: number;
  trend?: string;
  iconBg?: string;
  icon: React.ReactNode;
  spark?: number[];
}) {
  const positive = deltaPct >= 0;
  const points = (spark ?? defaultSpark).slice(-12);
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-primary-hover", iconBg)}>
          {icon}
        </span>
        <Sparkline points={points} positive={positive} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-bold leading-tight">{value}</p>
      <p
        className={cn(
          "mt-1 inline-flex items-center gap-1 text-xs",
          positive ? "text-success" : "text-danger",
        )}
      >
        {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(deltaPct)}% {trend ?? "จากเดือนก่อน"}
      </p>
    </article>
  );
}

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length === 0) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 110;
  const h = 36;
  const stepX = w / (points.length - 1 || 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${h - ((p - min) / range) * h}`)
    .join(" ");
  const color = positive ? "stroke-primary fill-primary/15" : "stroke-danger fill-danger/15";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} className={cn("fill-current", color.split(" ")[1])} stroke="none" />
      <path d={path} className={cn(color.split(" ")[0], "fill-none")} strokeWidth={1.8} />
    </svg>
  );
}

const defaultSpark = [3, 5, 4, 6, 8, 7, 9, 11, 10, 13, 14, 12];
