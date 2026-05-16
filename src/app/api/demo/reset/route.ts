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
import { generateItinerary } from "@/lib/agent";
import { structureObservation } from "@/lib/observations";
import type { StaffObservation } from "@/lib/types";

const SEED_PROMPTS = [
  "slow morning, cypress grove, unhurried dinner",
  "Saturday dinner for two, near sunset",
  "no early mornings, no crowds",
];

const SEED_OBSERVATION =
  "Marcie mentioned her sister's wedding in Sonoma next May.";

export async function POST() {
  // 1. Clear
  resetState();

  // 2. Seed itinerary (real Claude call when ANTHROPIC_API_KEY is set,
  //    deterministic fallback otherwise)
  const items = await generateItinerary(SEED_PROMPTS);
  setState((s) => {
    s.items = items;
    s.guest.statedIntent = SEED_PROMPTS;
    s.guest.name = "Marcie";
  });

  // 3. Seed staff observation
  const structured = await structureObservation(SEED_OBSERVATION);
  const obs: StaffObservation = {
    id: `obs-${Date.now()}`,
    text: SEED_OBSERVATION,
    structured,
    guestId: "g-demo",
    staffMember: "Front Desk",
    capturedAt: new Date().toISOString(),
  };
  setState((s) => {
    s.guest.observations.push(obs);
  });

  return NextResponse.json({
    ok: true,
    items: items.length,
    observation: structured,
  });
}
