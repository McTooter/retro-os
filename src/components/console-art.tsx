/**
 * Procedural box-art for homebrew games.
 *
 * Real box art is unlicensed to ship, and the homebrew games we're bundling
 * were never published commercially — they have no official covers. Instead
 * of a generic gradient, we paint a small "cover" that:
 *
 *   1. Uses the system's hero color as the dominant hue.
 *   2. Layers two pseudo-random angled gradients on top so every game reads
 *      as visually distinct from its neighbors.
 *   3. Adds a glossy top sheen — the single most important Frutiger Aero
 *      visual trope (XP-Luna-blue translucent gloss on every surface).
 *   4. Renders the title in a chunky display face, with a small "kicker"
 *      line in caps above it (the era or system tagline), so each card is
 *      readable as its own object rather than a colored rectangle.
 *
 * The shape of the cover is procedural: three stripes, a faint diagonal
 * hairlines, and a translucent overlay tint. No real copyrighted art is
 * referenced or implied.
 */

import type { CSSProperties } from "react";
import type { ConsoleInfo } from "@/lib/console";

export type BoxArtProps = {
  /** Game title to render on the cover. */
  title: string;
  /** Optional 0-360 hue override. */
  hue?: number;
  /** System hue (the hero color of the console) used as the cover base. */
  systemHue?: number;
  /** Optional short label rendered above the title (e.g. "8-BIT", "DEMO"). */
  kicker?: string;
  /** Size preset — affects aspect ratio and font sizes. */
  size?: "sm" | "md" | "lg" | "card";
};

const SIZE_ASPECT: Record<NonNullable<BoxArtProps["size"]>, string> = {
  sm: "aspect-[4/3]",
  md: "aspect-[3/4]",
  lg: "aspect-[4/5]",
  card: "aspect-[3/4]",
};

/** FNV-1a hash of a string → 32-bit unsigned integer. */
function seedFromId(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The procedural box-art cover. Accepts just a title and optional hue,
 * so it works for both bundled (system-known) and user-uploaded (system
 * inferred from filename) games.
 */
export function BoxArt({
  title,
  hue,
  systemHue,
  kicker,
  size = "md",
}: BoxArtProps) {
  const seed = seedFromId(title.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const angle = (seed % 120) - 60;
  const baseHue = hue ?? systemHue ?? 220;
  const aspect = SIZE_ASPECT[size];

  // Two angled gradient stops for the cover base.
  const c1 = `oklch(0.82 0.16 ${baseHue})`;
  const c2 = `oklch(0.7 0.18 ${(baseHue + 25) % 360})`;
  const c3 = `oklch(0.52 0.2 ${(baseHue + 60) % 360})`;

  // Title font sizes by size preset.
  const titleClass =
    size === "sm"
      ? "text-[10px] leading-tight"
      : size === "card"
        ? "text-base leading-tight"
        : size === "lg"
          ? "text-2xl leading-tight"
          : "text-lg leading-tight";

  const kickerClass = size === "sm" ? "text-[8px]" : "text-[10px]";

  // Optional subtle pattern: diagonal hairlines on a few cards.
  const showHairlines = (seed & 0b11) === 0;
  const hairlineStyle: CSSProperties = showHairlines
    ? {
        backgroundImage:
          "repeating-linear-gradient(45deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 7px)",
      }
    : {};

  return (
    <div
      className={`${aspect} relative overflow-hidden rounded-xl shadow-[inset_0_1px_0_oklch(1_0_0/0.5),0_8px_24px_-12px_oklch(0.3_0.05_240/0.5)] ring-1 ring-foreground/10`}
      style={{
        background: `linear-gradient(${angle + 90}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
        ...hairlineStyle,
      }}
    >
      {/* The glossy top sheen — the single most important Frutiger Aero
          visual trope. Two stacked radial highlights near the top. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
        style={{
          background:
            "linear-gradient(180deg, oklch(1 0 0 / 0.45) 0%, oklch(1 0 0 / 0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -inset-x-8 top-0 h-1/3"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, oklch(1 0 0 / 0.35) 0%, oklch(1 0 0 / 0) 60%)",
        }}
      />

      {/* Faint three-stripe motif at the bottom — evokes a real game box's
          spine banner, keeps each card legible at a glance. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/30 to-transparent" />

      {/* The title plate, sitting near the bottom-left. */}
      <div
        className={`absolute inset-x-0 bottom-0 ${size === "sm" ? "p-1.5" : "p-2.5"} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}
      >
        {kicker && (
          <div
            className={`${kickerClass} font-mono uppercase tracking-widest text-white/85`}
          >
            {kicker}
          </div>
        )}
        <div
          className={`${titleClass} font-extrabold tracking-tight [text-wrap:balance]`}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

/**
 * A SystemBadge — the small horizontal "logo" strip on the home screen
 * behind a console's name. Like a faux logo lockup, but procedural.
 */
export function ConsoleBadge({ console }: { console: ConsoleInfo }) {
  const [from, to] = console.gradient;
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_-4px_oklch(0.3_0.05_240/0.4)] ring-1 ring-white/30"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] opacity-90">
        {console.era}
      </span>
      <span className="text-sm font-extrabold leading-none">
        {console.name}
      </span>
    </div>
  );
}
