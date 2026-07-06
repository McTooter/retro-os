/**
 * Console metadata for RETRO//OS.
 *
 * Each entry is one "system" the frontend knows about: id, display name, the
 * Nostalgist.js core string, the file extension(s) the system accepts, the
 * accent palette used in the system card / library header, and the launch
 * year so we can show "1985 — 8-bit era" etc. in the sidebar.
 */

export type ConsoleId = "nes" | "snes" | "gb" | "gba" | "genesis";

/** A single console entry — id, name, gradient palette, metadata. */
export type ConsoleInfo = {
  id: ConsoleId;
  /** Title shown in the XMB row, the sidebar, and the player HUD. */
  name: string;
  /** RetroArch core name passed to Nostalgist.js. */
  core: string;
  /** Acceptable file extensions for the file-picker, lowercase, no dot. */
  extensions: string[];
  /** Two-stop gradient: [from, to], in oklch strings. Drives the system tile. */
  gradient: [string, string];
  /** Solid hero color for the icon disc and chips. oklch. */
  hero: string;
  /** Launch year. */
  year: number;
  /** One-line marketing flavor. */
  blurb: string;
  /** "8-BIT" / "16-BIT" etc. — small chip in the system tile. */
  era: string;
};
// Some components historically refer to this as `ConsoleDef`
export type ConsoleDef = ConsoleInfo;

export const CONSOLES: ConsoleInfo[] = [
  {
    id: "nes",
    name: "Nintendo",
    core: "fceumm",
    extensions: ["nes"],
    gradient: ["oklch(0.78 0.18 25)", "oklch(0.58 0.22 25)"],
    hero: "oklch(0.62 0.22 25)",
    year: 1983,
    blurb: "8-bit, gray brick, the one that started it all.",
    era: "8-BIT",
  },
  {
    id: "snes",
    name: "Super Nintendo",
    core: "snes9x",
    extensions: ["smc", "sfc"],
    gradient: ["oklch(0.78 0.18 295)", "oklch(0.58 0.22 295)"],
    hero: "oklch(0.62 0.22 295)",
    year: 1990,
    blurb: "16-bit, mode 7, the JRPG golden age.",
    era: "16-BIT",
  },
  {
    id: "gb",
    name: "Game Boy",
    core: "gambatte",
    extensions: ["gb", "gbc"],
    gradient: ["oklch(0.78 0.18 145)", "oklch(0.58 0.22 145)"],
    hero: "oklch(0.62 0.22 145)",
    year: 1989,
    blurb: "Pocketable, pea-green, the commute console.",
    era: "8-BIT",
  },
  {
    id: "gba",
    name: "Game Boy Advance",
    core: "mgba",
    extensions: ["gba"],
    gradient: ["oklch(0.78 0.18 245)", "oklch(0.58 0.22 245)"],
    hero: "oklch(0.62 0.22 245)",
    year: 2001,
    blurb: "Pocket SNES. The GBA SP was everyone's first screen.",
    era: "32-BIT",
  },
  {
    id: "genesis",
    name: "Sega Genesis",
    core: "genesis_plus_gx",
    extensions: ["gen", "md", "smd", "bin"],
    gradient: ["oklch(0.78 0.18 60)", "oklch(0.58 0.22 30)"],
    hero: "oklch(0.62 0.22 30)",
    year: 1988,
    blurb: "Blast processing. 16-bit in black plastic.",
    era: "16-BIT",
  },
];

export const CONSOLE_BY_ID: Record<ConsoleId, ConsoleInfo> = CONSOLES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<ConsoleId, ConsoleInfo>,
);

export function getConsole(id: ConsoleId): ConsoleInfo {
  const c = CONSOLES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown console: ${id}`);
  return c;
}

/** Type guard. */
export function isConsoleId(s: string | undefined): s is ConsoleId {
  return !!s && CONSOLES.some((c) => c.id === s);
}
