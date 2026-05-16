/**
 * One-click demo reset for live presentations.
 * Mirrors the logic of _demo/seed-state.sh but server-side so it can be
 * triggered from the in-app "Start New Demo" button without leaving Chrome.
 *
 * - Clears all state (items, photos, messages, observations, stamps)
 * - Re-generates the seed itinerary via the same code path the Preview page uses
 * - Pre-adds the staff observation about Marcie's sister's wedding in Sonoma
 * - Does NOT pre-attach the photo — the demo upload mechanic stays live
 */

import { NextResponse } from "next/server";
import { resetState, setState } from "@/lib/state";
import { deterministicItinerary } from "@/lib/tools";
import type { StaffObservation } from "@/lib/types";

const SEED_PROMPTS = [
  "slow morning, cypress grove, unhurried dinner",
  "Saturday dinner for two, near sunset",
  "no early mornings, no crowds",
];

const SEED_OBSERVATION =
  "Marcie mentioned her sister's wedding in Sonoma next May.";

// Pre-structured observation so we don't pay the Claude/Haiku round-trip
// on every reset. The structured fields match what structureObservation
// would produce for this exact text.
const SEED_OBS_STRUCTURED: Record<string, string> = {
  family_event: "sister's wedding",
  family_member: "sister",
  location_mentioned: "Sonoma",
  date_mentioned: "May",
  raw: SEED_OBSERVATION,
};

export async function POST() {
  // Use the deterministic itinerary so reset is instant (<100ms) instead
  // of waiting on the ~8s Claude call. The actual demo flow at /preview
  // still uses real Claude when the guest types their own answers.
  resetState();

  const items = deterministicItinerary(SEED_PROMPTS);
  setState((s) => {
    s.items = items;
    s.guest.statedIntent = SEED_PROMPTS;
    s.guest.name = "Marcie";
    s.guest.observations.push({
      id: `obs-${Date.now()}`,
      text: SEED_OBSERVATION,
      structured: SEED_OBS_STRUCTURED,
      guestId: "g-demo",
      staffMember: "Front Desk",
      capturedAt: new Date().toISOString(),
    } satisfies StaffObservation);
  });

  return NextResponse.json({
    ok: true,
    items: items.length,
    observation: SEED_OBS_STRUCTURED,
  });
}
