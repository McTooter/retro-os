/**
 * Bundled ROM catalog for RETRO//OS.
 *
 * Every entry here is freely-distributable homebrew by its original author.
 * For everything else, the user can drop in their own ROMs via the file
 * picker. We deliberately don't ship commercial ROMs.
 *
 * `romPath` is a URL the Nostalgist.js client will fetch — paths under
 * `/roms/` resolve from the public/ folder of the dev server / static site.
 */

import type { ConsoleId } from "./console";

export type BundledGame = {
  id: string;
  title: string;
  system: ConsoleId;
  author: string;
  year: number;
  /** Path under public/, e.g. "/roms/nes/vixy.nes". */
  romPath: string;
  /** A two-line blurb shown under the title in the library grid. */
  description: string;
  /** What this title is good for showing off in the player HUD. */
  tags: string[];
};

export const BUNDLED_GAMES: BundledGame[] = [
  // ── NES ────────────────────────────────────────────────────────────────
  {
    id: "nes-platforming",
    title: "Platforming Demo",
    system: "nes",
    author: "zorchenhimer",
    year: 2017,
    romPath: "/roms/nes/platforming.nes",
    description:
      "A short 6502 platformer demo. Tight controls, minimal scenery, all about the movement.",
    tags: ["platformer", "asm", "short"],
  },
  {
    id: "nes-vixy",
    title: "Vixy",
    system: "nes",
    author: "Zynidian",
    year: 2024,
    romPath: "/roms/nes/vixy.nes",
    description:
      "An endless-flying fairy collecting gems and dodging walls. GPLv3, GPL-licensed source.",
    tags: ["endless", "fly", "asm"],
  },
  {
    id: "nes-neslife",
    title: "NES Life",
    system: "nes",
    author: "NovaSquirrel",
    year: 2013,
    romPath: "/roms/nes/neslife.nes",
    description:
      "Conway's Game of Life running on real NES hardware. The screensaver, in 8-bit.",
    tags: ["simulation", "cellular", "demo"],
  },

  // ── SNES ───────────────────────────────────────────────────────────────
  {
    id: "snes-gothicvania",
    title: "Gothicvania",
    system: "snes",
    author: "donth77",
    year: 2026,
    romPath: "/roms/snes/gothicvania.sfc",
    description:
      "A Castlevania-flavored platformer demo in C using PVSnesLib. Original art, original music.",
    tags: ["platformer", "metroidvania"],
  },
  {
    id: "snes-helloworld",
    title: "Hello, World",
    system: "snes",
    author: "donth77",
    year: 2026,
    romPath: "/roms/snes/helloworld.sfc",
    description:
      "The smallest possible SNES program that draws to the screen. Boot the console, the demo runs.",
    tags: ["demo", "minimal"],
  },
];

export function gamesFor(system: ConsoleId): BundledGame[] {
  return BUNDLED_GAMES.filter((g) => g.system === system);
}
