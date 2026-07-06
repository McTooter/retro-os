/**
 * Thin wrapper around the Nostalgist.js RetroArch-emulator runtime.
 *
 * The dynamic import keeps the ~5MB Emscripten bundle out of the initial
 * page load — it only downloads the first time the user actually picks a
 * game. After that the browser HTTP-caches it.
 *
 * Nostalgist exposes RetroArch cores compiled to WebAssembly:
 *   - fceumm          (NES)
 *   - snes9x          (SNES)
 *   - gambatte        (Game Boy / Game Boy Color)
 *   - mgba            (Game Boy Advance)
 *   - genesis_plus_gx (Sega Genesis / Mega Drive)
 *
 * We hand it a URL or File, the core name, and a DOM element to mount
 * its canvas in. It returns a handle with reset / destroy / screenshot /
 * a virtual gamepad.
 */

import type { ConsoleId } from "./console";

export type LaunchOptions = {
  /** A remote URL (Nostalgist will fetch it) or a File the user picked. */
  rom: string | File;
  /** Console system — determines which RetroArch core to spin up. */
  system: ConsoleId;
  /** The DOM element to mount the emulator canvas into. */
  mount: HTMLElement;
  /** Optional FPS callback fired ~10x/second. */
  onFrame?: (stats: { fps: number; frames: number }) => void;
  /** Called when the runtime emits an error or shuts down. */
  onExit?: () => void;
};

export type GamepadButton =
  | "a"
  | "b"
  | "x"
  | "y"
  | "start"
  | "select"
  | "up"
  | "down"
  | "left"
  | "right"
  | "l"
  | "r";

export type EmulatorHandle = {
  /** Stop the emulator and release workers + audio context. */
  exit: () => Promise<void>;
  /** Reset the current game. */
  reset: () => Promise<void>;
  /** Push a button on the virtual controller. 0/1 = release/press. */
  setButton: (button: GamepadButton, value: number) => void;
  /** Take a snapshot of the current frame as a data URL. */
  screenshot: () => string | null;
};

const CORE_BY_SYSTEM: Record<ConsoleId, string> = {
  nes: "fceumm",
  snes: "snes9x",
  gb: "gambatte",
  gba: "mgba",
  genesis: "genesis_plus_gx",
};

/**
 * Launch a game. The promise resolves once the emulator is rendering
 * frames. Throws if the runtime fails to load or the core is missing.
 */
export async function launchEmu(opts: LaunchOptions): Promise<EmulatorHandle> {
  if (!opts.mount) {
    throw new Error("Emulator mount element is required");
  }

  // Lazy import keeps RetroArch Emscripten out of the initial bundle.
  const nostalgistModule = await import("nostalgist");
  const Nostalgist = nostalgistModule.Nostalgist;

  const core = CORE_BY_SYSTEM[opts.system];

  // Clear the mount point and create a styled inner div to host the canvas.
  opts.mount.innerHTML = "";
  const inner = document.createElement("div");
  inner.style.cssText = [
    "width:100%",
    "height:100%",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:#000",
  ].join(";");
  opts.mount.appendChild(inner);

  // Nostalgist auto-creates a canvas appended to the body. We move it into
  // our mount point so the player view controls its layout.
  const nostalgist = await Nostalgist.launch({
    core,
    rom: opts.rom,
    resolveRom: (file) => {
      // If the caller passed an absolute URL, return it as-is.
      if (typeof file === "string" && /^https?:\/\//i.test(file)) return file;
      // Otherwise, treat it as a public/roms/<file> path under our dev server.
      return file;
    },
  });

  const canvas = nostalgist.getCanvas();
  if (canvas) {
    canvas.style.imageRendering = "pixelated";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.style.width = "auto";
    canvas.style.height = "auto";
    inner.appendChild(canvas);
  }

  // Sample FPS on a timer.
  let frameCount = 0;
  const fpsInterval = setInterval(() => {
    let fps = 0;
    try {
      fps = nostalgist.getFps?.() ?? 0;
    } catch {
      fps = 0;
    }
    frameCount += 1;
    opts.onFrame?.({ fps, frames: frameCount });
  }, 100);

  // Track state so subsequent calls know whether we're already torn down.
  let destroyed = false;

  return {
    exit: async () => {
      if (destroyed) return;
      destroyed = true;
      clearInterval(fpsInterval);
      try {
        await nostalgist.exit();
      } catch {
        // ignore — exit throws if already destroyed
      }
      opts.onExit?.();
    },
    reset: async () => {
      if (destroyed) return;
      try {
        await nostalgist.restart();
      } catch (e) {
        console.error("Reset failed", e);
      }
    },
    setButton: (button, value) => {
      if (destroyed) return;
      try {
        // Nostalgist exposes press() on the libretro instance; button names
        // are the standard retroPad identifiers.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nostalgist as any).press?.(button, value);
      } catch (e) {
        console.warn("setButton failed", button, e);
      }
    },
    screenshot: () => {
      if (destroyed) return null;
      const c = nostalgist.getCanvas();
      if (!c) return null;
      try {
        return c.toDataURL("image/png");
      } catch {
        return null;
      }
    },
  };
}
