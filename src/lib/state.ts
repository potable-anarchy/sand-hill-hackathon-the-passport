/**
 * Server-side in-memory state singleton.
 * For the hackathon demo. Resets on dev reload, persists in prod within process lifetime.
 */

import type { PassportState } from "./types";

const DEMO_GUEST_NAME = "Marcie";

const initial: PassportState = {
  guest: {
    id: "g-demo",
    name: DEMO_GUEST_NAME,
    statedIntent: [],
    observations: [],
  },
  items: [],
  photos: [],
  messages: [],
  stampsEarned: 0,
  stampsBanked: 0,
};

declare global {
  // eslint-disable-next-line no-var
  var __passportState: PassportState | undefined;
}

if (!globalThis.__passportState) {
  globalThis.__passportState = structuredClone(initial);
}

export function getState(): PassportState {
  return globalThis.__passportState!;
}

export function setState(updater: (s: PassportState) => void): PassportState {
  updater(globalThis.__passportState!);
  return globalThis.__passportState!;
}

export function resetState(): void {
  globalThis.__passportState = structuredClone(initial);
}
