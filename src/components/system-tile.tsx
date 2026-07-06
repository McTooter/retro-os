/**
 * The XMB-style system tile — used on the home grid.
 *
 * Each system has its own gradient + icon. When selected the tile expands,
 * the icon scales up, and a glowing outer ring pulses. This is the central
 * navigational motif of the whole site: a horizontal strip of glowing
 * console orbs you scroll through.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import type { ConsoleDef } from "@/lib/console";
import { cn } from "@/lib/utils";

export function SystemTile({
  console,
  gameCount,
  selected = false,
  onHover,
  index = 0,
}: {
  console: ConsoleDef;
  gameCount: number;
  selected?: boolean;
  onHover?: () => void;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;

  return (
    <Link
      to={`/library/${console.id}`}
      onMouseEnter={() => {
        setHovered(true);
        onHover?.();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setHovered(true);
        onHover?.();
      }}
      onBlur={() => setHovered(false)}
      className={cn(
        "group block focus:outline-none",
      )}
      style={{
        // Stagger the entrance: each tile fades+slides in a beat later.
        animation: `retro-tile-in 600ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 70}ms both`,
      }}
      aria-label={`${console.name} — ${gameCount} game${gameCount === 1 ? "" : "s"}`}
    >
      <div
        className={cn(
          "relative aspect-[3/4] w-[200px] overflow-hidden rounded-3xl",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={{
          transform: active ? "translateY(-8px) scale(1.04)" : "translateY(0) scale(1)",
        }}
      >
        {/* Base disc with a soft inner shadow. */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% 20%, oklch(1 0 0 / 0.85) 0%, ${console.hero} 35%, ${console.deep} 100%)`,
            boxShadow: active
              ? `0 24px 60px -16px ${console.deep}aa, inset 0 2px 0 oklch(1 0 0 / 0.5), inset 0 -16px 24px oklch(0 0 0 / 0.25)`
              : `0 12px 28px -10px ${console.deep}66, inset 0 2px 0 oklch(1 0 0 / 0.35), inset 0 -10px 18px oklch(0 0 0 / 0.2)`,
          }}
        />

        {/* Glossy top sheen — the most important FA visual element. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0.65) 0%, oklch(1 0 0 / 0.18) 55%, transparent 100%)",
          }}
        />

        {/* The big era numeral behind the icon. */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-[12%] -translate-x-1/2 select-none",
            "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}
          style={{
            fontFamily: "'Bowlby One', system-ui",
            color: "oklch(1 0 0 / 0.85)",
            textShadow: `0 4px 12px ${console.deep}99`,
            fontSize: "3.5rem",
            lineHeight: 1,
            transform: `translateX(-50%) scale(${active ? 1.08 : 1})`,
            letterSpacing: "-0.04em",
          }}
        >
          {console.era}
        </div>

        {/* Console icon SVG. */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2",
            "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}
          style={{
            transform: `translateX(-50%) scale(${active ? 1.1 : 0.95})`,
          }}
        >
          <ConsoleGlyph id={console.id} />
        </div>

        {/* Bottom label — system name and game count. */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <div
            className="text-white"
            style={{
              fontFamily: "'Bowlby One', system-ui",
              fontSize: "0.95rem",
              letterSpacing: "-0.01em",
              textShadow: `0 2px 6px ${console.deep}88`,
              lineHeight: 1.1,
            }}
          >
            {console.name}
          </div>
          <div
            className="mt-1 text-white/80"
            style={{
              fontFamily: "'Inter', system-ui",
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {gameCount === 0
              ? "Drop a ROM to start"
              : `${gameCount} game${gameCount === 1 ? "" : "s"}`}
          </div>
        </div>

        {/* Glass edge — the thin inner stroke that sells the bubble. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.22)",
          }}
        />

        {/* Selected glow ring. */}
        {active && (
          <div
            className="pointer-events-none absolute -inset-[3px] rounded-3xl"
            style={{
              boxShadow: `0 0 0 2px ${console.hero}, 0 0 36px 4px ${console.hero}aa`,
              animation: "retro-pulse 2.4s ease-in-out infinite",
            }}
          />
        )}
      </div>
    </Link>
  );
}

/**
 * A small monochrome glyph for each console. Drawn as inline SVG so it
 * tints with the system color and stays sharp on any background.
 */
function ConsoleGlyph({ id }: { id: string }) {
  const stroke = "oklch(1 0 0 / 0.9)";
  const sw = 2.4;
  const props = {
    width: 72,
    height: 36,
    viewBox: "0 0 72 36",
    fill: "none",
    stroke,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" },
  };
  if (id === "nes") {
    // Rectangular console with a controller
    return (
      <svg {...props}>
        <rect x="2" y="10" width="44" height="20" rx="3" />
        <circle cx="12" cy="20" r="2.4" fill={stroke} />
        <circle cx="22" cy="20" r="2.4" fill={stroke} />
        <rect x="48" y="6" width="22" height="26" rx="11" />
        <circle cx="54" cy="14" r="1.6" fill={stroke} />
        <circle cx="64" cy="14" r="1.6" fill={stroke} />
        <path d="M54 22 L64 22 M59 18 L59 26" />
      </svg>
    );
  }
  if (id === "snes") {
    return (
      <svg {...props}>
        <rect x="2" y="8" width="48" height="22" rx="4" />
        <circle cx="11" cy="19" r="2.4" fill={stroke} />
        <circle cx="20" cy="19" r="2.4" fill={stroke} />
        <path d="M28 16 L32 19 L28 22 Z" fill={stroke} />
        <path d="M38 16 L42 19 L38 22 Z" fill={stroke} />
        <rect x="52" y="6" width="18" height="28" rx="14" />
        <path d="M58 14 L62 14 M60 12 L60 16" />
        <path d="M58 22 L62 22 M60 20 L60 24" />
      </svg>
    );
  }
  if (id === "gb") {
    return (
      <svg {...props}>
        <rect x="14" y="2" width="44" height="32" rx="3" />
        <rect x="20" y="7" width="32" height="18" rx="1" fill={stroke} fillOpacity="0.35" />
        <path d="M28 28 L36 28" />
        <path d="M22 32 L28 32" />
      </svg>
    );
  }
  if (id === "gba") {
    return (
      <svg {...props}>
        <path d="M2 8 L28 6 L28 30 L4 30 Z" />
        <path d="M70 8 L44 6 L44 30 L68 30 Z" />
        <rect x="30" y="10" width="12" height="20" rx="1" fill={stroke} fillOpacity="0.3" />
        <circle cx="58" cy="22" r="2" fill={stroke} />
        <circle cx="63" cy="18" r="1.5" fill={stroke} />
      </svg>
    );
  }
  // genesis
  return (
    <svg {...props}>
      <rect x="2" y="10" width="58" height="20" rx="3" />
      <circle cx="11" cy="20" r="3" />
      <circle cx="22" cy="20" r="2" fill={stroke} />
      <circle cx="50" cy="20" r="4" />
      <path d="M62 10 L62 30 M58 14 L66 14" />
    </svg>
  );
}
