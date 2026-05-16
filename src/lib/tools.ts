/**
 * Typed tool-use functions Claude can call.
 * Same architecture as MCP, without the wire protocol.
 */

import { EXPERIENCES, experienceById, type Experience } from "./property-catalog";
import { getState, setState } from "./state";
import type { PassportItem, StampState } from "./types";

// ─── Tool schemas (passed to Claude as `tools` array) ────────────────────────

export const TOOL_SCHEMAS = [
  {
    name: "get_property_info",
    description:
      "Get the catalog of experiences available at Rosewood Sand Hill. Returns name, category, description, slots, durations, and unlocks. Use this when the guest asks about what's available, what's good for dinner, or when planning the itinerary.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["dining", "wellness", "active", "cultural", "entertainment", "all"],
          description: "Optional filter by category. 'all' returns everything.",
        },
      },
      required: [],
    },
  },
  {
    name: "query_availability",
    description:
      "Check what slots are available for a specific experience. Returns the list of time slots the experience can be held in.",
    input_schema: {
      type: "object" as const,
      properties: {
        experienceId: {
          type: "string",
          description: "The experience ID to query (e.g. 'madera-tasting').",
        },
      },
      required: ["experienceId"],
    },
  },
  {
    name: "update_passport",
    description:
      "Modify the guest's passport. Use action='swap' to replace one held experience with an alternate, 'move' to change the time slot, 'add' to add a new experience, or 'remove' to drop one.",
    input_schema: {
      type: "object" as const,
      properties: {
        action: {
          type: "string",
          enum: ["swap", "move", "add", "remove"],
          description: "The mutation to perform.",
        },
        itemId: {
          type: "string",
          description: "The passport item ID to act on (for swap/move/remove). Omit for add.",
        },
        experienceId: {
          type: "string",
          description: "The experience ID (for swap to alternate, or for add).",
        },
        slot: {
          type: "string",
          description: "The new time slot (for move/add).",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "redeem_experience",
    description:
      "Mark an experience as stamped (attended) or banked (missed). Triggers the unlock surface.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: {
          type: "string",
          description: "The passport item ID being redeemed.",
        },
        outcome: {
          type: "string",
          enum: ["stamped", "banked"],
          description: "stamped = attended, banked = missed (hotel owes guest)",
        },
      },
      required: ["itemId", "outcome"],
    },
  },
];

// ─── Tool handlers ──────────────────────────────────────────────────────────

export function handleToolCall(name: string, input: Record<string, unknown>): unknown {
  switch (name) {
    case "get_property_info":
      return handleGetPropertyInfo(input);
    case "query_availability":
      return handleQueryAvailability(input);
    case "update_passport":
      return handleUpdatePassport(input);
    case "redeem_experience":
      return handleRedeemExperience(input);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function handleGetPropertyInfo(input: Record<string, unknown>): unknown {
  const category = input.category as string | undefined;
  if (!category || category === "all") {
    return { experiences: EXPERIENCES };
  }
  return { experiences: EXPERIENCES.filter((e) => e.category === category) };
}

function handleQueryAvailability(input: Record<string, unknown>): unknown {
  const id = input.experienceId as string;
  const exp = experienceById(id);
  if (!exp) return { error: `Experience not found: ${id}` };
  return { experienceId: id, name: exp.name, slots: exp.slots };
}

function handleUpdatePassport(input: Record<string, unknown>): unknown {
  const action = input.action as string;
  const itemId = input.itemId as string | undefined;
  const experienceId = input.experienceId as string | undefined;
  const slot = input.slot as string | undefined;

  const state = setState((s) => {
    if (action === "swap" && itemId && experienceId) {
      const item = s.items.find((i) => i.id === itemId);
      if (item) {
        item.experienceId = experienceId;
        // Remove the new experienceId from alternates if present
        item.alternates = item.alternates.filter((a) => a !== experienceId);
      }
    } else if (action === "move" && itemId && slot) {
      const item = s.items.find((i) => i.id === itemId);
      if (item) item.slot = slot;
    } else if (action === "add" && experienceId && slot) {
      s.items.push({
        id: `item-${Date.now()}`,
        experienceId,
        slot,
        state: "held",
        alternates: [],
      });
    } else if (action === "remove" && itemId) {
      s.items = s.items.filter((i) => i.id !== itemId);
    }
  });

  return { ok: true, items: state.items };
}

function handleRedeemExperience(input: Record<string, unknown>): unknown {
  const itemId = input.itemId as string;
  const outcome = input.outcome as StampState;

  const state = setState((s) => {
    const item = s.items.find((i) => i.id === itemId);
    if (item) {
      item.state = outcome;
      item.redeemedAt = new Date().toISOString();
      if (outcome === "stamped") s.stampsEarned += 1;
      else if (outcome === "banked") s.stampsBanked += 1;
    }
  });

  const item = state.items.find((i) => i.id === itemId);
  const exp = item ? experienceById(item.experienceId) : null;
  return {
    ok: true,
    itemId,
    outcome,
    unlock: exp?.unlock,
    stampsEarned: state.stampsEarned,
    stampsBanked: state.stampsBanked,
  };
}

// ─── Helper for non-Claude paths: deterministic itinerary generator ────────

/**
 * Builds an initial passport from 3 prompt answers using keyword matching.
 * Used as fallback when MOCK_MODE=true or Claude is unavailable.
 */
export function deterministicItinerary(prompts: string[]): PassportItem[] {
  const text = prompts.join(" ").toLowerCase();
  const picks: { exp: Experience; slot: string }[] = [];

  // Heuristic: pick a morning, an afternoon, an evening, plus 1-2 extras
  const pickFrom = (cat: Experience["category"], slot: string) => {
    const candidates = EXPERIENCES.filter(
      (e) => e.category === cat && !picks.some((p) => p.exp.id === e.id),
    );
    if (candidates.length === 0) return null;
    return candidates[0];
  };

  // Morning: coffee or cycling or pool
  if (text.match(/morning|sunrise|early|active|ride|cycling/)) {
    const cycling = experienceById("cycling-concierge");
    if (cycling) picks.push({ exp: cycling, slot: cycling.slots[0] });
  } else {
    const bici = experienceById("bici-coffee");
    if (bici) picks.push({ exp: bici, slot: bici.slots[0] });
  }

  // Wellness: spa or pool
  if (text.match(/slow|relax|unwind|spa|recovery|wellness/)) {
    const spa = experienceById("asaya-spa");
    if (spa) picks.push({ exp: spa, slot: spa.slots[0] });
  } else {
    const pool = experienceById("pool-access");
    if (pool) picks.push({ exp: pool, slot: pool.slots[0] });
  }

  // Cultural/entertainment
  if (text.match(/wine|ridge|vineyard|tasting/)) {
    const ridge = experienceById("ridge-rose-reveal");
    if (ridge) picks.push({ exp: ridge, slot: ridge.slots[0] });
  } else if (text.match(/perfume|scent|art|library/)) {
    const perfumer = experienceById("clubhouse-perfumer");
    if (perfumer) picks.push({ exp: perfumer, slot: perfumer.slots[0] });
  }

  // Evening: dinner always
  const madera = experienceById("madera-tasting");
  if (madera) picks.push({ exp: madera, slot: madera.slots[0] });

  // Build items with alternates for the dining slot
  const items: PassportItem[] = picks.map((p, idx) => {
    const alternates =
      p.exp.category === "dining"
        ? EXPERIENCES.filter(
            (e) => e.category === "dining" && e.id !== p.exp.id,
          ).slice(0, 2).map((e) => e.id)
        : [];
    return {
      id: `item-${idx}-${p.exp.id}`,
      experienceId: p.exp.id,
      slot: p.slot,
      state: "held",
      alternates,
    };
  });

  return items;
}
