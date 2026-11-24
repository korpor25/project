export type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = 38;
  const c = 2 * Math.PI * r;

  // Pre-compute arc geometry with reduce (no mutation) so the immutability
  // lint rule is satisfied. cumLen tracks the running offset for the next segment.
  // The donut is rotated -90° so segments start at 12 o'clock; the inner
  // <text> elements need the inverse rotation around their own anchor point
  // (transform-origin) so they read horizontally — not vertically.
  const arcs = segments
    .reduce<{ key: string; color: string; dasharray: string; dashoffset: number; cumLen: number }[]>(
      (acc, s) => {
        const prevCumLen = acc.length > 0 ? acc[acc.length - 1].cumLen : 0;
        const len = (s.value / total) * c;
        return [...acc, { key: s.label, color: s.color, dasharray: `${len} ${c - len}`, dashoffset: -prevCumLen, cumLen: prevCumLen + len }];
      },
      [],
    );

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="-50 -50 100 100" className="h-40 w-40 -rotate-90">
        <circle cx="0" cy="0" r={r} fill="none" stroke="#eee" strokeWidth="14" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
          />
        ))}
        <g transform="rotate(90)">
          <text
            x="0"
            y="-2"
            textAnchor="middle"
            className="fill-muted-foreground text-[6px]"
          >
            {centerLabel}
          </text>
          <text
            x="0"
            y="8"
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            {centerValue}
          </text>
        </g>
      </svg>
      <ul className="flex-1 space-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
            <span className="font-medium">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
