export type RevenuePoint = { label: string; revenue: number; bookings: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  // Guard against the all-zero case (no approved bookings yet for this
  // period). React throws "Received NaN" warnings when a `y` or `height`
  // attribute is `0/0`. Fall back to 1 so the chart renders flat lines
  // along the baseline.
  const maxRev = Math.max(1, ...data.map((d) => d.revenue));
  const maxBookings = Math.max(1, ...data.map((d) => d.bookings));
  const w = 600;
  const h = 200;
  const padX = 40;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const stepX = innerW / (data.length - 1 || 1);
  const barWidth = Math.max(10, stepX * 0.55);

  const safeY = (n: number, max: number) => {
    if (max <= 0 || !isFinite(n)) return padY + innerH;
    return padY + innerH - (n / max) * innerH;
  };

  const linePath = data
    .map((d, i) => {
      const x = padX + i * stepX;
      const y = safeY(d.bookings, maxBookings);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      {/* y-axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const y = padY + innerH - p * innerH;
        return (
          <g key={p}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#eee" strokeWidth="1" />
            <text x={padX - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
              {Math.round((maxRev * p) / 1000)}K
            </text>
          </g>
        );
      })}

      {/* Bars (revenue) */}
      {data.map((d, i) => {
        const x = padX + i * stepX - barWidth / 2;
        const bh = Math.max(0, (d.revenue / maxRev) * innerH);
        const y = padY + innerH - bh;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={bh}
              rx="3"
              className="fill-primary"
              opacity={0.85}
            />
            <text
              x={padX + i * stepX}
              y={h - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Line (bookings) */}
      <path d={linePath} className="fill-none stroke-foreground" strokeWidth="2" />
      {data.map((d, i) => {
        const x = padX + i * stepX;
        const y = safeY(d.bookings, maxBookings);
        return (
          <circle key={`pt-${i}`} cx={x} cy={y} r={3.5} className="fill-foreground" />
        );
      })}
    </svg>
  );
}
