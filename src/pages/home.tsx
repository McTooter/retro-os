/**
 * The home screen.
 *
 * Three vertical layers:
 *   1. The wave header (shared).
 *   2. The XMB-style horizontal console strip. This is the central
 *      navigation: arrow keys move a glowing selection through the
 *      console orbs; the right rail shows the active console's metadata.
 *   3. A featured "Now playing" rail and a "Continue your library" rail
 *      of recently added homebrew games.
 *
 * Aesthetic: a single page that sells the Frutiger Aero vibe with one
 * bold, deliberate moment — the wave-underline under the XMB bar, the
 * glassy console tiles, and the floating cloud. Everything else is quiet
 * so the tiles breathe.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Download,
  Play,
  Plus,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AeroBackground } from "@/components/aero-background";
import { SystemTile } from "@/components/system-tile";
import { WaveHeader } from "@/components/wave-header";
import { CONSOLES } from "@/lib/console";
import { BUNDLED_GAMES } from "@/lib/games";
import { LibraryGame } from "@/lib/library-store";
import { useLibrary } from "@/lib/library-store";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const consoles = CONSOLES;
  const [activeIndex, setActiveIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const library = useLibrary((s) => s.games);
  const userGames = library.length;

  // Arrow-key navigation across the XMB strip.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => Math.min(consoles.length - 1, i + 1));
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((i) => Math.max(0, i - 1));
        e.preventDefault();
      } else if (e.key === "Enter") {
        // Open the active console.
        const id = consoles[activeIndex]?.id;
        if (id) window.location.href = `/library/${id}`;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, consoles]);

  // Scroll the active tile into view when navigating with arrow keys.
  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  const active = consoles[activeIndex];
  const activeGames = BUNDLED_GAMES.filter((g) => g.system === active.id);
  const userGamesForActive = library.filter((g) => g.system === active.id);

  return (
    <div className="relative min-h-screen text-foreground">
      <AeroBackground variant="home" />

      <WaveHeader />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-10">
        {/* Hero — oversized display type, a one-line pitch, and a stat
            strip of "what's available right now". */}
        <section className="mt-2 flex flex-col items-center text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-3 py-1 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur"
            style={{ animation: "retro-fade-up 600ms 80ms both" }}
          >
            <Sparkles className="size-3.5" />
            <span style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Retro//OS · {userGames} in your library
            </span>
          </div>

          <h1
            className="mt-5 text-balance text-5xl leading-[0.95] sm:text-7xl"
            style={{
              fontFamily: "'Bowlby One', system-ui",
              color: "oklch(0.16 0.04 220)",
              textShadow: "0 2px 0 oklch(1 0 0 / 0.6)",
              letterSpacing: "-0.03em",
              animation: "retro-fade-up 700ms 140ms both",
            }}
          >
            Play the games
            <br />
            <span
              style={{
                background:
                  "linear-gradient(120deg, oklch(0.55 0.15 200) 0%, oklch(0.45 0.18 240) 50%, oklch(0.55 0.16 165) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              that raised us.
            </span>
          </h1>

          <p
            className="mt-4 max-w-xl text-pretty text-base text-foreground/75 sm:text-lg"
            style={{ animation: "retro-fade-up 700ms 220ms both" }}
          >
            A browser frontend for classic consoles — Frutiger-Aero glossy,
            XMB-navigable, with a real RetroArch core powering every game.
            Drop in your own ROMs or play the bundled homebrew.
          </p>

          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
            style={{ animation: "retro-fade-up 700ms 300ms both" }}
          >
            <Button
              size="lg"
              className="rounded-full px-5"
              onClick={() => (window.location.href = "/library")}
            >
              <Play className="size-4" />
              Open the library
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full bg-white/40 px-5 backdrop-blur"
              onClick={() => (window.location.href = "/play")}
            >
              <Upload className="size-4" />
              Drop a ROM to play
            </Button>
          </div>
        </section>

        {/* The XMB strip. The signature element. */}
        <section
          className="relative mt-14"
          style={{ animation: "retro-fade-up 800ms 400ms both" }}
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60"
              >
                Systems
              </div>
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: "'Bowlby One', system-ui",
                  letterSpacing: "-0.02em",
                  color: "oklch(0.18 0.04 220)",
                }}
              >
                Choose a console
              </h2>
            </div>
            <div className="hidden items-center gap-2 text-xs text-foreground/60 sm:flex">
              <span>Use</span>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <span>to browse,</span>
              <Kbd>↵</Kbd>
              <span>to open</span>
            </div>
          </div>

          <div
            ref={stripRef}
            className="relative -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-2"
            style={{ scrollbarWidth: "none" }}
          >
            {consoles.map((c, i) => (
              <div
                key={c.id}
                data-index={i}
                className="shrink-0 snap-center"
                onMouseEnter={() => setActiveIndex(i)}
              >
                <SystemTile
                  console={c}
                  gameCount={BUNDLED_GAMES.filter((g) => g.system === c.id).length}
                  selected={i === activeIndex}
                  onHover={() => setActiveIndex(i)}
                  index={i}
                />
              </div>
            ))}
          </div>

          {/* Right rail: the active console's full info. Reads as a glossy
              info card. */}
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className="rounded-3xl border border-white/45 bg-white/45 p-5 shadow-[0_12px_36px_-12px_oklch(0.4_0.08_220/0.35)] backdrop-blur-xl md:col-span-2"
              style={{
                transition: "all 320ms ease",
              }}
              key={active.id}
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid size-16 place-items-center rounded-2xl text-2xl text-white"
                  style={{
                    fontFamily: "'Bowlby One', system-ui",
                    background: `linear-gradient(160deg, ${active.hero} 0%, ${active.deep} 100%)`,
                    boxShadow: `0 6px 18px -4px ${active.deep}99, inset 0 1px 0 oklch(1 0 0 / 0.5)`,
                  }}
                >
                  {active.era}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/55"
                  >
                    {active.manufacturer} · {active.year}–{active.endYear ?? "present"}
                  </div>
                  <h3
                    className="mt-0.5 text-2xl"
                    style={{
                      fontFamily: "'Bowlby One', system-ui",
                      letterSpacing: "-0.02em",
                      color: "oklch(0.2 0.04 220)",
                    }}
                  >
                    {active.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-pretty text-foreground/70">
                    {active.tagline}
                  </p>
                </div>
                <Link to={`/library/${active.id}`}>
                  <Button className="rounded-full" size="sm">
                    Open
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat label="Bundled homebrew" value={activeGames.length} />
                <Stat label="Your ROMs" value={userGamesForActive.length} />
                <Stat
                  label="Core"
                  value={
                    <span className="font-mono text-xs">{active.core}</span>
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/45 bg-white/45 p-5 shadow-[0_12px_36px_-12px_oklch(0.4_0.08_220/0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                <Zap className="size-3.5" /> Recent in your library
              </div>
              {library.length === 0 ? (
                <div className="mt-3 text-sm text-foreground/65">
                  Nothing yet.{" "}
                  <Link
                    to="/play"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Drop a ROM
                  </Link>{" "}
                  to start your collection.
                </div>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {library.slice(0, 4).map((g) => (
                    <li
                      key={g.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-foreground/85">
                        {g.title}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-wider text-foreground/45">
                        {g.system}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Featured games rail — pulled from the bundled set. */}
        <section
          className="mt-16"
          style={{ animation: "retro-fade-up 800ms 500ms both" }}
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Bundled
              </div>
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: "'Bowlby One', system-ui",
                  letterSpacing: "-0.02em",
                  color: "oklch(0.18 0.04 220)",
                }}
              >
                Free to play, free to keep
              </h2>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground"
            >
              See all
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {BUNDLED_GAMES.map((g, i) => (
              <Link
                key={g.id}
                to={`/play?game=${g.id}`}
                className="group block focus:outline-none"
                style={{
                  animation: `retro-tile-in 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`,
                }}
              >
                <FeaturedGameCard game={g} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function FeaturedGameCard({ game }: { game: LibraryGame | (typeof BUNDLED_GAMES)[number] }) {
  const console = CONSOLES.find((c) => c.id === game.system)!;
  return (
    <div className="group/feat relative">
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-2xl",
          "transition-all duration-300 ease-out",
          "group-hover:-translate-y-1 group-hover:scale-[1.03]",
        )}
        style={{
          boxShadow: `0 10px 26px -10px ${console.deep}55, inset 0 1px 0 oklch(1 0 0 / 0.5)`,
          background: `linear-gradient(160deg, ${console.hero} 0%, ${console.deep} 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
          style={{
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0.55) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-3 bottom-3 text-white"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
        >
          <div
            className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] opacity-80"
          >
            {console.name}
          </div>
          <div
            className="mt-0.5 text-sm leading-tight"
            style={{ fontFamily: "'Bowlby One', system-ui" }}
          >
            {game.title}
          </div>
        </div>
        <div className="absolute right-3 top-3">
          <div className="grid size-7 place-items-center rounded-full bg-white/30 text-white backdrop-blur">
            <Play className="size-3.5 fill-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur">
      <div className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
        {label}
      </div>
      <div
        className="mt-0.5 text-lg"
        style={{
          fontFamily: "'Bowlby One', system-ui",
          color: "oklch(0.2 0.04 220)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-foreground/15 bg-white/60 px-1.5 text-[0.65rem] font-medium text-foreground/70 shadow-[0_1px_0_oklch(0.6_0.05_220/0.2)]">
      {children}
    </kbd>
  );
}
