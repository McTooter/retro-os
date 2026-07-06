/**
 * User's personal library — games they've loaded onto the device.
 *
 * Stored in localStorage so a refresh doesn't wipe the catalog. Each entry
 * records: id (uuid), title, system, the original File object (so we can
 * hand it back to the emulator runtime), and the cover color (used by the
 * procedural box art).
 *
 * IMPORTANT: we don't persist the File in localStorage — the File is
 * non-serializable. The library re-hydrates from localStorage with the
 * metadata only; clicking a stored game prompts the user to re-select the
 * ROM file from disk. (Same UX as most browser emulators.)
 */

import { useSyncExternalStore } from "react";
import type { ConsoleId } from "./console";

export type LibraryGame = {
  id: string;
  title: string;
  system: ConsoleId;
  /** Opaque in-memory handle to the File. Not serialized. */
  file: File;
  coverHue: number;
  addedAt: number;
};

const STORAGE_KEY = "retro-os-library-v1";

type Serialized = {
  id: string;
  title: string;
  system: ConsoleId;
  coverHue: number;
  addedAt: number;
  fileName: string;
  fileSize: number;
};

const listeners = new Set<() => void>();
let games: LibraryGame[] = [];
let hydrated = false;

function loadFromStorage(): Serialized[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Serialized[];
  } catch {
    return [];
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  const data: Serialized[] = games.map((g) => ({
    id: g.id,
    title: g.title,
    system: g.system,
    coverHue: g.coverHue,
    addedAt: g.addedAt,
    fileName: g.file.name,
    fileSize: g.file.size,
  }));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota — ignore */
  }
}

function notify() {
  for (const l of listeners) l();
}

function ensureHydrated() {
  if (hydrated) return;
  hydrated = true;
  // We can't restore the File objects from localStorage — but we can mark
  // the slots as "needs re-selection" by storing stubs. The player page
  // checks `game.file` and prompts a re-pick if it's null.
  const stored = loadFromStorage();
  games = stored.map((s) => ({
    id: s.id,
    title: s.title,
    system: s.system,
    coverHue: s.coverHue,
    addedAt: s.addedAt,
    // We make a placeholder File from a Blob pointing to nothing — the
    // UI detects this stub and asks the user to re-pick.
    file: new File([new Uint8Array(0)], s.fileName, { type: "application/octet-stream" }),
  }));
}

export const libraryStore = {
  subscribe(cb: () => void) {
    ensureHydrated();
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  getSnapshot() {
    ensureHydrated();
    return games;
  },
  addGame(input: { title: string; system: ConsoleId; file: File; coverHue?: number }) {
    const id = crypto.randomUUID();
    const game: LibraryGame = {
      id,
      title: input.title,
      system: input.system,
      file: input.file,
      coverHue: input.coverHue ?? Math.floor(Math.random() * 360),
      addedAt: Date.now(),
    };
    games = [game, ...games];
    saveToStorage();
    notify();
    return game;
  },
  removeGame(id: string) {
    games = games.filter((g) => g.id !== id);
    saveToStorage();
    notify();
  },
  /** Re-attach a file to a previously-saved entry. */
  attachFile(id: string, file: File) {
    games = games.map((g) => (g.id === id ? { ...g, file, title: g.title || file.name.replace(/\.[^.]+$/, "") } : g));
    saveToStorage();
    notify();
  },
};

export function useLibrary<T>(selector: (s: { games: LibraryGame[] }) => T): T {
  return useSyncExternalStore(
    libraryStore.subscribe,
    () => selector({ games: libraryStore.getSnapshot() }),
    () => selector({ games: [] }),
  );
}
