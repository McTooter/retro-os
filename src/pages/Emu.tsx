/**
 * /emu — alias for /play.
 *
 * Renders the same fullscreen player. Caller is expected to supply
 * ?rom= or ?game=. When you land here with no params, you get a
 * "No game specified" state — the home page and Library buttons pass
 * the right query string before navigating.
 */

import PlayerPage from "./player";

export default function EmuPage() {
  return <PlayerPage />;
}
