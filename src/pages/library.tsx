/**
 * The library page.
 *
 * Two sections:
 *   1. The user's own games (loaded via the file picker), grouped by
 *      system, with a delete button and a one-click "play" button.
 *   2. The bundled homebrew library, framed as a discoverable shelf.
 *
 * The drop zone accepts files via drag-and-drop OR a click-to-pick; on
 * drop, the file is added to the library and the user is sent to the
 * player page.
 */

import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CloudUpload,
  Gamepad2,
  HardDriveDownload,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AeroBackground } from "@/components/aero-background";
import { BoxArt } from "@/components/console-art";
import { WaveHeader } from "@/components/wave-header";
import { CONSOLES, CONSOLE_BY_ID, type ConsoleId } from "@/lib/console";
import { BUNDLED_GAMES } from "@/lib/games";
import { libraryStore, useLibrary } from "@/lib/library-store";
import { cn } from "@/lib/utils";

function inferSystemFromFilename(name: string): ConsoleId | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".nes")) return "nes";
  if (lower.endsWith(".sfc") || lower.endsWith(".smc")) return "snes";
  if (lower.endsWith(".gb") || lower.endsWith(".gbc")) return "gb";
  if (lower.endsWith(".gba")) return "gba";
  if (lower.endsWith(".md") || lower.endsWith(".gen") || lower.endsWith(".bin")) {
    return "genesis";
  }
  return null;
}

export default function LibraryPage() {
  const params = useParams<{ system?: string }>();
  const navigate = useNavigate();
  const userGames = useLibrary((s) => s.games);
  const [filter, setFilter] = useState("");
  const [dropActive, setDropActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeSystemId = params.system as ConsoleId | undefined;
  const activeSystem = activeSystemId ? CONSOLE_BY_ID[activeSystemId] : null;

  function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    for (const file of list) {
      const system = inferSystemFromFilename(file.name);
      if (!system) continue;
      const title = file.name.replace(/\.[^.]+$/, "");
      const game = libraryStore.addGame({ title, system, file });
      // If the user dropped on the system-filtered page, jump straight in.
      if (activeSystemId && system === activeSystemId) {
        navigate(`/play?game=${game.id}`);
        return;
      }
    }
    // If they dropped on the all-systems page, jump into the first one's
    // player.
    if (!activeSystemId && list.length > 0) {
      navigate(`/play`);
    }
  }

  // Filtered user games, grouped by system.
  const filtered = userGames.filter(
    (g) =>
      !filter.trim() ||
      g.title.toLowerCase().includes(filter.toLowerCase()),
  );
  const filteredBundled = BUNDLED_GAMES.filter(
    (g) =>
      (!activeSystemId || g.system === activeSystemId) &&
      (!filter.trim() || g.title.toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <div className="relative min-h-screen text-foreground">
      <AeroBackground variant="library" />

      <WaveHeader />

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-10">
        {/* Page title + search + upload */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              {activeSystem ? activeSystem.name : "All systems"}
            </div>
            <h1
              className="mt-1 text-4xl sm:text-5xl"
              style={{
                fontFamily: "'Bowlby One', system-ui",
                letterSpacing: "-0.02em",
                color: "oklch(0.18 0.04 220)",
                textShadow: "0 2px 0 oklch(1 0 0 / 0.55)",
              }}
            >
              {activeSystem ? activeSystem.tagline : "Your library"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search…"
                className="h-9 rounded-full border border-white/50 bg-white/55 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none backdrop-blur focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button
              size="default"
              className="rounded-full"
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="size-4" />
              Add ROM
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".nes,.sfc,.smc,.gb,.gbc,.gba,.md,.gen,.bin"
              multiple
              hidden
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        </header>

        {/* System filter chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          <FilterChip
            active={!activeSystemId}
            onClick={() => navigate("/library")}
            label="All"
            hue="neutral"
          />
          {CONSOLES.map((c) => (
            <FilterChip
              key={c.id}
              active={activeSystemId === c.id}
              onClick={() => navigate(`/library/${c.id}`)}
              label={c.name}
              hue={c.id}
            />
          ))}
        </div>

        {/* Drop zone — large, glossy, takes up the top of the page. */}
        <div
          className={cn(
            "mt-6 flex cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed bg-white/30 p-8 text-center backdrop-blur transition-all",
            dropActive
              ? "scale-[1.01] border-primary bg-primary/10 shadow-[0_20px_60px_-20px_oklch(0.55_0.15_200/0.55)]"
              : "border-white/60 hover:border-primary/40 hover:bg-white/45",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDropActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInput.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="grid size-14 place-items-center rounded-2xl border border-white/55 bg-white/65 text-primary shadow-[inset_0_-2px_0_oklch(0_0_0/0.06),0_4px_14px_oklch(0.4_0.08_220/0.18)]">
              <CloudUpload className="size-7" />
            </div>
            <div
              className="text-lg"
              style={{
                fontFamily: "'Bowlby One', system-ui",
                color: "oklch(0.18 0.04 220)",
              }}
            >
              Drop ROMs here
            </div>
            <p className="max-w-md text-sm text-foreground/65">
              Or click to choose. .nes · .sfc/.smc · .gb/.gbc · .gba · .md/.gen
            </p>
          </div>
        </div>

        {/* Your games (user library) */}
        {filtered.length > 0 && (
          <Section
            title="Your games"
            subtitle={`${filtered.length} ${filtered.length === 1 ? "title" : "titles"} loaded from your device`}
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((g) => {
                const sys = CONSOLE_BY_ID[g.system];
                return (
                  <article
                    key={g.id}
                    className="group relative flex flex-col gap-2 rounded-2xl border border-white/45 bg-white/35 p-3 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-[0_18px_40px_-12px_oklch(0.4_0.08_220/0.35)]"
                  >
                    <BoxArt
                      title={g.title}
                      hue={g.coverHue}
                      systemHue={sys.hue}
                      size="card"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-sm font-semibold"
                          style={{ color: "oklch(0.2 0.04 220)" }}
                          title={g.title}
                        >
                          {g.title}
                        </div>
                        <div className="truncate text-xs text-foreground/55">
                          {sys.name} · {(g.file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      <button
                        onClick={() => libraryStore.removeGame(g.id)}
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-white/55 bg-white/55 text-foreground/55 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        aria-label="Remove from library"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <Link
                      to={`/play?game=${g.id}`}
                      className="absolute inset-0 z-0 rounded-2xl"
                      aria-label={`Play ${g.title}`}
                    />
                    <div className="pointer-events-none relative z-10 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <Gamepad2 className="size-3" /> Play
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>
        )}

        {/* Bundled homebrew */}
        <Section
          title="Bundled homebrew"
          subtitle="Free homebrew games shipped with the OS — play them right now"
        >
          {filteredBundled.length === 0 ? (
            <div className="rounded-2xl border border-white/45 bg-white/35 px-4 py-10 text-center text-sm text-foreground/60 backdrop-blur">
              No bundled games match this filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredBundled.map((g) => {
                const sys = CONSOLE_BY_ID[g.system];
                return (
                  <Link
                    key={g.id}
                    to={`/play?rom=${encodeURIComponent(g.romPath)}&system=${g.system}&title=${encodeURIComponent(g.title)}`}
                    className="group relative flex flex-col gap-2 rounded-2xl border border-white/45 bg-white/35 p-3 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-[0_18px_40px_-12px_oklch(0.4_0.08_220/0.35)]"
                  >
                    <BoxArt
                      title={g.title}
                      hue={g.coverHue}
                      systemHue={sys.hue}
                      size="card"
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-sm font-semibold"
                        style={{ color: "oklch(0.2 0.04 220)" }}
                        title={g.title}
                      >
                        {g.title}
                      </div>
                      <div className="truncate text-xs text-foreground/55">
                        {sys.name} · by {g.author} · {g.year}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <Gamepad2 className="size-3" /> Play
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>

        {userGames.length === 0 && filteredBundled.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/45 bg-white/45 p-4 backdrop-blur">
            <HardDriveDownload className="mt-0.5 size-5 text-primary" />
            <div className="text-sm text-foreground/75">
              <strong className="text-foreground">Heads up:</strong> we only
              ship homebrew games by default. To play commercial classics, drop
              your own ROM files into the cloud above — they stay on your
              device.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2
            className="text-2xl"
            style={{
              fontFamily: "'Bowlby One', system-ui",
              letterSpacing: "-0.02em",
              color: "oklch(0.18 0.04 220)",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  hue,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hue: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary/40 bg-primary/15 text-primary shadow-[0_4px_12px_-4px_oklch(0.55_0.15_200/0.4)]"
          : "border-white/50 bg-white/35 text-foreground/70 backdrop-blur hover:bg-white/55 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
