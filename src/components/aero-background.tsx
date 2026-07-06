/**
 * The signature Frutiger Aero background.
 *
 * Three stacked SVG layers:
 *   1. A panoramic sky → grass → earth gradient (the "2007 hero" image).
 *   2. Drifting bokeh circles (the soft pastel light blooms).
 *   3. A few large translucent bubbles with a sharp top highlight.
 *
 * The whole thing is fixed behind the app so it doesn't scroll, and pointer
 * events are disabled so it never eats clicks.
 *
 * Variant: "home" (full landscape with hills) or "subtle" (just sky + a few
 * bubbles, used on the library/player pages so the content stays legible).
 */

import { cn } from "@/lib/utils";

export function AeroBackground({
  variant = "home",
  className,
}: {
  variant?: "home" | "subtle";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Sky → sea → grass panorama. The colors are tuned to match the
          theme.json: aqua-blue at the top, deeper sea-blue in the middle,
          fresh green at the bottom. */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="aero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.92 0.04 215)" />
            <stop offset="35%" stopColor="oklch(0.78 0.08 210)" />
            <stop offset="70%" stopColor="oklch(0.65 0.11 200)" />
            <stop offset="100%" stopColor="oklch(0.55 0.12 195)" />
          </linearGradient>
          <linearGradient id="aero-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.16 145)" />
            <stop offset="100%" stopColor="oklch(0.55 0.15 145)" />
          </linearGradient>
          <radialGradient id="aero-sun" cx="0.78" cy="0.18" r="0.45">
            <stop offset="0%" stopColor="oklch(1 0 0 / 0.8)" />
            <stop offset="30%" stopColor="oklch(0.98 0.04 195 / 0.4)" />
            <stop offset="100%" stopColor="oklch(0.98 0.04 195 / 0)" />
          </radialGradient>
          <radialGradient id="bubble-blue" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="oklch(1 0 0 / 0.85)" />
            <stop offset="40%" stopColor="oklch(0.8 0.1 200 / 0.35)" />
            <stop offset="100%" stopColor="oklch(0.6 0.1 200 / 0.1)" />
          </radialGradient>
        </defs>

        <rect width="1600" height="1000" fill="url(#aero-sky)" />
        <rect width="1600" height="1000" fill="url(#aero-sun)" />

        {variant === "home" && (
          <>
            {/* Distant rolling hill silhouettes — softened almost to the
                horizon. Three layers, each progressively darker. */}
            <path
              d="M0 720 C 200 660, 400 700, 600 690 C 800 680, 1000 720, 1200 700 C 1400 680, 1600 710, 1600 720 L 1600 1000 L 0 1000 Z"
              fill="oklch(0.7 0.13 155 / 0.55)"
            />
            <path
              d="M0 800 C 240 740, 480 800, 720 780 C 960 760, 1200 810, 1440 790 C 1520 783, 1600 790, 1600 800 L 1600 1000 L 0 1000 Z"
              fill="oklch(0.62 0.15 150 / 0.7)"
            />
            <path
              d="M0 880 C 220 840, 460 890, 700 880 C 940 870, 1200 900, 1440 890 C 1520 887, 1600 890, 1600 900 L 1600 1000 L 0 1000 Z"
              fill="url(#aero-grass)"
            />

            {/* A few abstract leaf sprites — small "tropical" curves. */}
            {LEAVES.map((l, i) => (
              <path
                key={i}
                d={l.d}
                fill={l.fill}
                opacity="0.6"
                transform={l.tx}
              />
            ))}
          </>
        )}

        {/* Bokeh circles — the soft pastel light blooms scattered in the sky. */}
        {BOKEHS.map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill={b.fill}
            opacity={b.o}
          />
        ))}

        {/* Large translucent bubbles. */}
        {BUBBLES.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <circle r={b.r} fill="url(#bubble-blue)" />
            <ellipse
              cx={-b.r * 0.3}
              cy={-b.r * 0.45}
              rx={b.r * 0.25}
              ry={b.r * 0.12}
              fill="oklch(1 0 0 / 0.8)"
              transform={`rotate(-25 ${-b.r * 0.3} ${-b.r * 0.45})`}
            />
            <circle
              r={b.r}
              fill="none"
              stroke="oklch(1 0 0 / 0.45)"
              strokeWidth="1.4"
            />
          </g>
        ))}
      </svg>

      {/* A subtle film grain to soften the gradient banding. */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")",
        }}
      />
    </div>
  );
}

const BOKEHS = [
  { cx: 200, cy: 180, r: 90, fill: "oklch(0.95 0.06 95)", o: 0.45 },
  { cx: 480, cy: 100, r: 60, fill: "oklch(0.92 0.08 145)", o: 0.4 },
  { cx: 720, cy: 220, r: 110, fill: "oklch(0.95 0.04 195)", o: 0.35 },
  { cx: 1080, cy: 80, r: 75, fill: "oklch(0.96 0.05 100)", o: 0.45 },
  { cx: 1340, cy: 260, r: 90, fill: "oklch(0.92 0.07 175)", o: 0.4 },
  { cx: 1500, cy: 120, r: 50, fill: "oklch(0.95 0.06 130)", o: 0.5 },
  { cx: 100, cy: 420, r: 70, fill: "oklch(0.95 0.04 195)", o: 0.3 },
  { cx: 1480, cy: 460, r: 60, fill: "oklch(0.95 0.06 90)", o: 0.3 },
];

const BUBBLES = [
  { x: 220, y: 320, r: 60 },
  { x: 1300, y: 540, r: 90 },
  { x: 1480, y: 700, r: 50 },
  { x: 80, y: 700, r: 70 },
  { x: 760, y: 80, r: 36 },
];

const LEAVES = [
  {
    d: "M0 0 C 20 -30, 60 -30, 80 0 C 60 30, 20 30, 0 0 Z",
    fill: "oklch(0.55 0.12 145)",
    tx: "translate(60 880) rotate(-15)",
  },
  {
    d: "M0 0 C 20 -30, 60 -30, 80 0 C 60 30, 20 30, 0 0 Z",
    fill: "oklch(0.5 0.13 150)",
    tx: "translate(1500 900) rotate(20)",
  },
  {
    d: "M0 0 C 15 -22, 45 -22, 60 0 C 45 22, 15 22, 0 0 Z",
    fill: "oklch(0.6 0.14 145)",
    tx: "translate(820 940) rotate(-8)",
  },
  {
    d: "M0 0 C 18 -26, 52 -26, 70 0 C 52 26, 18 26, 0 0 Z",
    fill: "oklch(0.52 0.13 150)",
    tx: "translate(1180 950) rotate(15)",
  },
];
