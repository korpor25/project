/**
 * The gold panel used as the side art on the login / register / forgot-password
 * pages. The artwork is folded gold satin — soft diagonal light and shadow that
 * echoes the curve of the CS mark. No repeating motif: it should read as a
 * surface catching light, never as a pattern.
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

/** `className` lets a caller drop the rounding when the panel is embedded
 *  inside a larger card (see the login page). */
export function BrandPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative hidden overflow-hidden rounded-2xl bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 400 600"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="bp-field" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8ca85" />
            <stop offset="42%" stopColor="#cda54c" />
            <stop offset="100%" stopColor="#a37c24" />
          </linearGradient>

          {/* Each fold fades out at both ends so no band shows a hard edge. */}
          <linearGradient id="bp-sheen" x1="0" y1="1" x2="0.85" y2="0">
            <stop offset="0%" stopColor="#fff4dc" stopOpacity="0" />
            <stop offset="45%" stopColor="#fff4dc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff4dc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bp-shade" x1="0" y1="1" x2="0.85" y2="0">
            <stop offset="0%" stopColor="#6f5214" stopOpacity="0" />
            <stop offset="50%" stopColor="#6f5214" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6f5214" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bp-bloom">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
          </radialGradient>

          {/* Blur is what turns hard bands into cloth — enough to lose the edge,
              not so much that the folds stop reading as folds. */}
          <filter id="bp-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="19" />
          </filter>
          <filter id="bp-bloom-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="34" />
          </filter>

          <radialGradient id="bp-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#5f4611" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#5f4611" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#5f4611" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="600" fill="url(#bp-field)" />

        {/* Folds run on one diagonal, at irregular widths so the eye never
            locks onto a rhythm. */}
        <g filter="url(#bp-soft)" transform="rotate(-24 200 300)">
          <rect x="-210" y="-300" width="104" height="1200" fill="url(#bp-sheen)" />
          <rect x="-46" y="-300" width="38" height="1200" fill="url(#bp-sheen)" opacity="0.7" />
          <rect x="96" y="-300" width="150" height="1200" fill="url(#bp-shade)" opacity="0.75" />
          <rect x="300" y="-300" width="72" height="1200" fill="url(#bp-sheen)" opacity="0.55" />
          <rect x="430" y="-300" width="180" height="1200" fill="url(#bp-shade)" opacity="0.6" />
        </g>

        {/* Light catching the top-left of the cloth. */}
        <ellipse
          cx="110"
          cy="120"
          rx="210"
          ry="170"
          fill="url(#bp-bloom)"
          filter="url(#bp-bloom-soft)"
        />

        {/* The one crisp thing on the panel: contour lines following the fold,
            drawn with the same sweep as the CS mark. */}
        <g fill="none" stroke="#fff4dc" strokeLinecap="round">
          <path
            d="M -60 600 C 60 470, 160 370, 215 205 C 250 100, 262 30, 258 -30"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          <path
            d="M 10 620 C 130 490, 230 390, 285 225 C 320 120, 332 50, 328 -10"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <path
            d="M -150 570 C -30 440, 70 340, 125 175"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        </g>

        <rect width="400" height="600" fill="url(#bp-vignette)" />
      </svg>

      {/* Lockup and tagline share one white plate — the logo's gold mark is
          nearly --primary (#c9a24a) and white body copy on gold only reaches
          ~3:1, so neither reads directly against the panel. */}
      <div className="relative z-10 flex max-w-xs flex-col items-center rounded-2xl bg-white px-8 py-7 text-center shadow-xl ring-1 ring-black/5">
        <Image
          src="/logo.png"
          alt="CS Exhibition Management"
          width={500}
          height={500}
          className="h-36 w-36 object-contain"
          priority
        />
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          ระบบจองพื้นที่บูธและอีเวนต์
          <br />
          ในศูนย์การค้าครบจบในระบบเดียว
        </p>
      </div>
    </div>
  );
}
