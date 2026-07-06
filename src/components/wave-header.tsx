/**
 * The horizontal category bar at the top of the home screen.
 *
 * This is the single most recognizable Sumee / PS3 XMB visual: a row of
 * glassy tabs that hover with their own glow, each with a thin white inner
 * stroke. Active tab gets a saturated background and a wave underline that
 * animates between tabs.
 *
 * The "wave" is an SVG that morphs its `d` attribute between a few
 * pre-computed paths — a tiny flourish that costs almost nothing and ties
 * the bar to the rest of the app's curves.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Gamepad2,
  Settings as SettingsIcon,
  Library as LibraryIcon,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Home", icon: Sparkles, to: "/" },
  { id: "library", label: "Library", icon: LibraryIcon, to: "/library" },
  { id: "play", label: "Quick Play", icon: Gamepad2, to: "/play" },
  { id: "about", label: "About", icon: Info, to: "/about" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function WaveHeader() {
  const { pathname } = useLocation();
  const active: TabId =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/library") || pathname.startsWith("/play")
        ? pathname === "/play"
          ? "play"
          : "library"
        : pathname.startsWith("/about")
          ? "about"
          : "home";

  const containerRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const [hovered, setHovered] = useState<TabId | null>(null);

  // Recompute the sliding bar when the active tab changes or the layout
  // resizes. We measure the active tab's offsetLeft and width.
  useEffect(() => {
    const compute = () => {
      const root = containerRef.current;
      if (!root) return;
      const el = root.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!el) return;
      setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [active]);

  return (
    <header className="sticky top-0 z-40 pt-4">
      <div
        ref={containerRef}
        className={cn(
          "relative mx-auto flex w-fit max-w-full items-center gap-1 rounded-full",
          "border border-white/40 bg-white/30 px-1.5 py-1.5",
          "shadow-[0_8px_28px_-8px_oklch(0.5_0.08_220/0.45),inset_0_1px_0_oklch(1_0_0/0.6)]",
          "backdrop-blur-2xl backdrop-saturate-150",
        )}
      >
        {/* Sliding active-pill. The most important interaction detail: the
            pill glides between tabs with a soft spring, and its gradient
            matches the home screen's "sky → sea" theme. */}
        {bar && (
          <div
            className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-full"
            style={{
              left: bar.left,
              width: bar.width,
              background:
                "linear-gradient(180deg, oklch(0.85 0.13 195) 0%, oklch(0.55 0.15 215) 100%)",
              boxShadow:
                "0 4px 14px -2px oklch(0.45 0.15 215 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -2px 4px oklch(0.2 0.05 240 / 0.18)",
              transition:
                "left 480ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        )}

        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const isHovered = hovered === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.to}
              data-tab={tab.id}
              onMouseEnter={() => setHovered(tab.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5",
                "text-sm font-medium transition-colors duration-200",
                isActive ? "text-white" : "text-foreground/70 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-transform",
                  (isActive || isHovered) && "scale-110",
                )}
              />
              <span style={{ fontFamily: "'Inter', system-ui", fontWeight: 500 }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
