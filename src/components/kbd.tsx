/**
 * The keyboard-shortcut chip used in the XMB rail.
 *
 * Renders as a tiny glassy key — white glass top, inset shadow on the
 * bottom edge. This is the same key treatment Windows Vista used for
 * shortcut callouts in its Aero-era help system.
 */
import { cn } from "@/lib/utils";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/55 bg-white/70 px-1.5 text-[10px] font-semibold text-foreground/80 shadow-[inset_0_-1.5px_0_oklch(0_0_0/0.12),0_1px_0_oklch(1_0_0/0.6)] backdrop-blur",
        className,
      )}
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {children}
    </kbd>
  );
}
