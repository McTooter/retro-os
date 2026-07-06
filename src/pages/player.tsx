/**
 * The fullscreen player.
 *
 * Boots the Nostalgist.js RetroArch runtime, mounts the canvas into the
 * frame, and surfaces a glassy command bar across the top with system info,
 * frame count, and a few actions: pause, reset, fullscreen, save-state,
 * load-state, quit.
 *
 * If the user came from a bundled ROM (URL: `?rom=&system=&title=`), the
 * emu fetches the URL. If they came from their own library (`?game=`), the
 * File is pulled from the library store — and if the slot is a placeholder
 * (page was refreshed and the File isn't in memory any more), we show a
 * re-pick dialog.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Crosshair,
  Gamepad2,
  Loader2,
  Maximize2,
  Pause,
  Play,
  PowerOff,
  RefreshCw,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AeroBackground } from "@/components/aero-background";
import { WaveHeader } from "@/components/wave-header";
import { CONSOLE_BY_ID, type ConsoleId } from "@/lib/console";
import { launchEmu, type EmulatorHandle } from "@/lib/emulator";
import { libraryStore, useLibrary, type LibraryGame } from "@/lib/library-store";
import { cn } from "@/lib/utils";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "ready" }
  | { kind: "needs-file"; title: string; system: ConsoleId }
  | { kind: "error"; message: string };

export default function PlayerPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleRef = useRef<EmulatorHandle | null>(null);
  const [state, setState] = useState<LoadState>({ kind: "idle" });
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ fps: 0, frames: 0 });
  const [fullscreen, setFullscreen] = useState(false);

  // Resolve the launch target (either a bundled rom or a library game).
  const gameParam = search.get("game");
  const romParam = search.get("rom");
  const systemParam = search.get("system") as ConsoleId | null;
  const titleParam = search.get("title") || "Game";
  const userGame = useLibrary((s) =>
    gameParam ? s.games.find((g) => g.id === gameParam) : undefined,
  );

  const launch = useCallback(async () => {
    if (!mountRef.current) return;
    if (handleRef.current) {
      handleRef.current.exit();
      handleRef.current = null;
    }
    mountRef.current.innerHTML = "";
    setState({ kind: "loading", message: "Fetching ROM…" });

    let romInput: { file: File; system: ConsoleId; title: string } | { url: string; system: ConsoleId; title: string };
    if (romParam && systemParam) {
      romInput = { url: romParam, system: systemParam, title: titleParam };
    } else if (userGame) {
      // Detect a placeholder file (zero bytes) — those mean the library
      // was hydrated from localStorage and the original File is gone.
      if (userGame.file.size === 0) {
        setState({ kind: "needs-file", title: userGame.title, system: userGame.system });
        return;
      }
      romInput = { file: userGame.file, system: userGame.system, title: userGame.title };
    } else {
      setState({ kind: "error", message: "No game specified." });
      return;
    }

    try {
      setState({ kind: "loading", message: "Booting emulator…" });
      const h = await launchEmu({
        mount: mountRef.current,
        rom: ("url" in romInput ? romInput.url : romInput.file),
        system: romInput.system,
        onFrame: (frame) => setStats((s) => ({ fps: frame.fps, frames: s.frames + 1 })),
        onExit: () => setState({ kind: "idle" }),
      });
      handleRef.current = h;
      setState({ kind: "ready" });
    } catch (e) {
      console.error(e);
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to launch game.",
      });
    }
  }, [romParam, systemParam, titleParam, userGame]);

  useEffect(() => {
    void launch();
    return () => {
      handleRef.current?.exit();
      handleRef.current = null;
    };
  }, [launch]);

  // Wire keyboard pause/reset.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "F1") setPaused((p) => !p);
      if (e.key === "F2") handleRef.current?.reset();
      if (e.key === "F5") handleRef.current?.saveState();
      if (e.key === "F9") handleRef.current?.loadState();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handlePickedFile(file: File) {
    if (state.kind === "needs-file" && gameParam) {
      libraryStore.attachFile(gameParam, file);
      setState({ kind: "loading", message: "Reloading…" });
      // Small delay so the store update re-renders and the launch() closure
      // picks up the new file.
      setTimeout(() => void launch(), 0);
    }
  }

  function toggleFullscreen() {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  const activeSystem = (systemParam || userGame?.system) && CONSOLE_BY_ID[systemParam || userGame?.system!];
  const title = userGame?.title || titleParam;

  return (
    <div className="relative min-h-screen text-foreground">
      <AeroBackground variant="player" />
      <WaveHeader />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to library
          </Link>
          {activeSystem && (
            <div className="flex items-center gap-2 text-sm">
              <span
                className="inline-block size-2.5 rounded-full shadow-[0_0_10px_var(--tw-shadow-color)]"
                style={{ background: `oklch(0.7 0.18 ${activeSystem.hue})`, boxShadow: `0 0 10px oklch(0.7 0.18 ${activeSystem.hue} / 0.65)` }}
              />
              <span className="font-semibold text-foreground/75">{activeSystem.name}</span>
            </div>
          )}
        </div>

        <h1
          className="mb-4 text-3xl sm:text-4xl"
          style={{
            fontFamily: "'Bowlby One', system-ui",
            letterSpacing: "-0.02em",
            color: "oklch(0.18 0.04 220)",
          }}
        >
          {title}
        </h1>

        {/* The game frame */}
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-white/55 bg-black/85 shadow-[0_30px_60px_-20px_oklch(0.3_0.05_220/0.45),inset_0_0_0_1px_oklch(1_0_0/0.06)]",
            fullscreen ? "h-[calc(100vh-220px)]" : "h-[min(60vh,560px)]",
          )}
        >
          {/* CRT scanlines + glass overlay on top of the canvas */}
          <div
            ref={mountRef}
            className="absolute inset-0 grid place-items-center"
            style={{ imageRendering: "pixelated" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
            style={{
              background:
                "repeating-linear-gradient(to bottom, oklch(1 0 0 / 0.04) 0px, oklch(1 0 0 / 0.04) 1px, transparent 1px, transparent 3px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, oklch(0 0 0 / 0.45) 100%)",
            }}
          />

          {/* Loading state */}
          {state.kind === "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-white">
                <Loader2 className="size-10 animate-spin" />
                <div className="text-sm font-medium tracking-wide">
                  {state.message}
                </div>
                <div className="text-xs text-white/55">
                  First launch downloads the RetroArch core (~3–5 MB)
                </div>
              </div>
            </div>
          )}

          {/* Idle / error */}
          {(state.kind === "idle" || state.kind === "error") && (
            <div className="absolute inset-0 grid place-items-center text-center text-white">
              <div>
                <Gamepad2 className="mx-auto size-12 text-white/40" />
                <p className="mt-3 text-sm text-white/70">
                  {state.kind === "error" ? state.message : "No game loaded."}
                </p>
                {state.kind === "error" && (
                  <Button onClick={launch} className="mt-3 rounded-full">
                    <RefreshCw className="size-4" /> Try again
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Needs file (library hydrate) */}
          {state.kind === "needs-file" && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
              <div className="max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
                <Upload className="mx-auto size-10 text-white/85" />
                <div className="mt-3 text-lg font-semibold">
                  Re-pick “{state.title}”
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Browsers don't let us keep your ROM file across a page
                  refresh. Choose the same file again to keep playing.
                </p>
                <Button
                  className="mt-4 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" /> Choose ROM
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nes,.sfc,.smc,.gb,.gbc,.gba,.md,.gen,.bin"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePickedFile(f);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Command bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/55 bg-white/55 px-4 py-2.5 shadow-[inset_0_1px_0_oklch(1_0_0/0.6),0_4px_14px_oklch(0.3_0.05_220/0.1)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-1.5">
            <CommandButton
              icon={paused ? Play : Pause}
              label={paused ? "Resume" : "Pause"}
              shortcut="F1"
              onClick={() => {
                setPaused((p) => !p);
                if (paused) handleRef.current?.resume();
                else handleRef.current?.pause();
              }}
            />
            <CommandButton
              icon={RefreshCw}
              label="Reset"
              shortcut="F2"
              onClick={() => handleRef.current?.reset()}
            />
            <CommandButton
              icon={Save}
              label="Save state"
              shortcut="F5"
              onClick={() => handleRef.current?.saveState()}
            />
            <CommandButton
              icon={Crosshair}
              label="Load state"
              shortcut="F9"
              onClick={() => handleRef.current?.loadState()}
            />
            <CommandButton
              icon={Maximize2}
              label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/65">
            <span className="font-mono">FPS {stats.fps.toFixed(0)}</span>
            <span className="font-mono">FRAMES {stats.frames}</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  state.kind === "ready" ? "bg-emerald-500" : "bg-amber-400",
                )}
              />
              {state.kind === "ready" ? "RUNNING" : state.kind.toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => {
                handleRef.current?.exit();
                navigate("/library");
              }}
            >
              <PowerOff className="size-3.5" /> Quit
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function CommandButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/55 px-2.5 py-1.5 text-xs font-medium text-foreground/80 shadow-[inset_0_1px_0_oklch(1_0_0/0.55)] transition-colors hover:bg-white/80 hover:text-foreground"
    >
      <Icon className="size-3.5" />
      {label}
      {shortcut && (
        <span
          className="ml-1 rounded border border-white/55 bg-white/65 px-1 py-px text-[10px] font-mono text-foreground/55"
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}
