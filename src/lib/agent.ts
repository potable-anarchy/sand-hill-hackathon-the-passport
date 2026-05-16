/**
 * Claude agent wrapper.
 * - MOCK_MODE=true → returns deterministic responses (works without API key)
 * - MOCK_MODE=false → calls Claude with tool-use
 */

import Anthropic from "@anthropic-ai/sdk";
import { TOOL_SCHEMAS, handleToolCall, deterministicItinerary } from "./tools";
import type { PassportItem } from "./types";
import { CONCIERGE, EXPERIENCES, experienceById } from "./property-catalog";
import { getState, setState } from "./state";

const MOCK = process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

const client = MOCK
  ? null
  : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ─── Itinerary generation (called from /api/itinerary/generate) ────────────

export async function generateItinerary(prompts: string[]): Promise<PassportItem[]> {
  if (MOCK) {
    return deterministicItinerary(prompts);
  }

  const systemPrompt = `You are an itinerary architect for Rosewood Sand Hill, a luxury hotel in Menlo Park. The guest has answered three prompts about what they want from their stay. Use the get_property_info tool to see available experiences. Then propose 4-5 itinerary items that match their stated intent. For dining items, hold 2 alternates in reserve.

Return your final answer as a JSON object: { "items": [{ "experienceId": "...", "slot": "...", "alternates": ["..."] }] }

Be concise. Match the guest's tone — if they asked for slow, don't pack the schedule. If they're active, build accordingly.`;

  const userMessage = `The guest answered:\n\n1. "What would feel like a perfect day here?": ${prompts[0] || "(no answer)"}\n2. "Anything we should plan around?": ${prompts[1] || "(no answer)"}\n3. "Anything you'd rather not?": ${prompts[2] || "(no answer)"}\n\nGenerate their itinerary.`;

  // Tool-use loop
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];
  let response = await client!.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    system: systemPrompt,
    tools: TOOL_SCHEMAS,
    messages,
  });

  // Handle tool calls
  while (response.stop_reason === "tool_use") {
    const toolUses = response.content.filter((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => ({
      type: "tool_result",
      tool_use_id: tu.id,
      content: JSON.stringify(handleToolCall(tu.name, tu.input as Record<string, unknown>)),
    }));
    messages.push({ role: "user", content: toolResults });
    response = await client!.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: systemPrompt,
      tools: TOOL_SCHEMAS,
      messages,
    });
  }

  // Parse final text response
  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("Claude returned non-JSON, falling back to deterministic");
    return deterministicItinerary(prompts);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { items: Array<{ experienceId: string; slot: string; alternates?: string[] }> };
    return parsed.items.map((it, idx) => ({
      id: `item-${idx}-${it.experienceId}`,
      experienceId: it.experienceId,
      slot: it.slot,
      state: "held" as const,
      alternates: it.alternates || [],
    }));
  } catch (e) {
    console.warn("Failed to parse Claude JSON, falling back", e);
    return deterministicItinerary(prompts);
  }
}

// ─── Concierge chat (called from /api/concierge) ───────────────────────────

export type ConciergeReply = {
  text: string;
  stateChanged: boolean;
};

export async function conciergeReply(
  guestMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<ConciergeReply> {
  if (MOCK) {
    return mockConciergeReply(guestMessage);
  }

  const systemPrompt = `You are ${CONCIERGE.name}, the Sand Hill concierge at Rosewood Sand Hill in Menlo Park. Your tone: ${CONCIERGE.tone}.

You have access to the property catalog and can modify the guest's passport using the available tools. When the guest asks you to do something (move an experience, ask about availability, swap restaurants), use the tools to actually do it — don't just describe what you would do.

Be brief. Specific. Never markety. Match the editorial tone of a Rosewood property.`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: guestMessage },
  ];

  let response = await client!.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: systemPrompt,
    tools: TOOL_SCHEMAS,
    messages,
  });

  let stateChanged = false;
  while (response.stop_reason === "tool_use") {
    const toolUses = response.content.filter((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => {
      if (tu.name === "update_passport" || tu.name === "redeem_experience") stateChanged = true;
      return {
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(handleToolCall(tu.name, tu.input as Record<string, unknown>)),
      };
    });
    messages.push({ role: "user", content: toolResults });
    response = await client!.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOL_SCHEMAS,
      messages,
    });
  }

  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  return { text, stateChanged };
}

// ─── Mock concierge fallback ────────────────────────────────────────────────

/**
 * Smarter mock concierge that:
 *  - actually mutates state when the guest asks for a move/swap/redemption
 *  - references items that exist in the current passport (no fabricated "hike"
 *    when the guest only has cycling)
 *  - doesn't promise state changes it can't deliver
 */
function mockConciergeReply(guestMessage: string): ConciergeReply {
  const state = getState();
  const msg = guestMessage.toLowerCase();
  const items = state.items;

  // Helper: find a held item whose experience matches a hint word.
  const findHeld = (hints: string[]) =>
    items.find((it) => {
      if (it.state !== "held" && it.state !== "unlocked") return false;
      const exp = experienceById(it.experienceId);
      if (!exp) return false;
      const blob = (exp.name + " " + exp.category + " " + exp.id).toLowerCase();
      return hints.some((h) => blob.includes(h));
    });

  // ── Intent: move / reschedule a specific experience ────────────────────
  if (msg.match(/move|reschedule|push|swap.*time|earlier|later/)) {
    // Try to figure out which one. Pull the first held item that matches
    // a keyword in the guest's message, falling back to the next held item.
    const hintMatch =
      findHeld(["cycling", "ride"]) && msg.match(/cycl|ride/i)
        ? findHeld(["cycling", "ride"])
        : findHeld(["spa", "asaya"]) && msg.match(/spa|asaya|massage/i)
          ? findHeld(["spa", "asaya"])
          : findHeld(["coffee", "bici"]) && msg.match(/coffee|bici|breakfast/i)
            ? findHeld(["coffee", "bici"])
            : findHeld(["tasting", "madera", "dinner"]) &&
                msg.match(/dinner|tasting|madera/i)
              ? findHeld(["tasting", "madera", "dinner"])
              : items.find((i) => i.state === "held");

    if (!hintMatch) {
      return {
        text: "Your passport is light right now — nothing to move yet.",
        stateChanged: false,
      };
    }
    const exp = experienceById(hintMatch.experienceId);
    if (!exp) return { text: "Hmm — one moment.", stateChanged: false };

    // Pick a different slot from the experience's available list, or shift
    // the current slot label slightly so the demo shows a visible change.
    const otherSlot =
      exp.slots.find((s) => s !== hintMatch.slot) ||
      shiftedSlot(hintMatch.slot);

    setState((s) => {
      const t = s.items.find((i) => i.id === hintMatch.id);
      if (t) t.slot = otherSlot;
    });

    return {
      text: `Done. ${exp.name} moved to ${otherSlot}.`,
      stateChanged: true,
    };
  }

  // ── Intent: cancel / drop / remove an experience ──────────────────────
  if (msg.match(/cancel|drop|remove|don't want|nevermind|skip/)) {
    const target = items.find((i) => i.state === "held");
    if (!target) {
      return {
        text: "Nothing held that I can drop. Your passport is clear.",
        stateChanged: false,
      };
    }
    const exp = experienceById(target.experienceId);
    setState((s) => {
      s.items = s.items.filter((i) => i.id !== target.id);
    });
    return {
      text: `Done. ${exp?.name ?? "That one"} is off the passport.`,
      stateChanged: true,
    };
  }

  // ── Intent: dinner / hungry — prefer dinner-y experiences, not tea ──────
  if (msg.match(/dinner|hungry|tonight|eat|food|hangry/)) {
    const dinnerPriorityIds = [
      "madera-tasting",
      "madera-bar",
      "friday-nights-madera",
    ];
    const dinner =
      items.find(
        (i) =>
          dinnerPriorityIds.includes(i.experienceId) &&
          (i.state === "held" || i.state === "unlocked"),
      ) ||
      items.find((i) => {
        const exp = experienceById(i.experienceId);
        return (
          exp?.category === "dining" &&
          (i.state === "held" || i.state === "unlocked")
        );
      });
    if (dinner) {
      const exp = experienceById(dinner.experienceId)!;
      return {
        text: `${exp.name} is on the passport for ${dinner.slot}. I can hold a quieter corner if you'd like, or pull you toward the bar instead.`,
        stateChanged: false,
      };
    }
    return {
      text: "Nothing dining on the passport yet — want me to hold the Madera tasting Friday at 6:30?",
      stateChanged: false,
    };
  }

  // ── Intent: wine / pairing / sommelier ─────────────────────────────────
  if (msg.match(/wine|pair|sommelier|ridge/)) {
    const tasting = items.find(
      (i) => i.experienceId === "madera-tasting" || i.experienceId === "madera-bar",
    );
    if (tasting) {
      const exp = experienceById(tasting.experienceId)!;
      return {
        text: `I'll let Sofia know you're coming to ${exp.name} ${tasting.slot}. She'll walk you through the Ridge pairing after the third course.`,
        stateChanged: false,
      };
    }
    return {
      text: "Sofia at Madera handles the Ridge pairing — happy to hold a slot if you want.",
      stateChanged: false,
    };
  }

  // ── Intent: spa ───────────────────────────────────────────────────────
  if (msg.match(/spa|massage|asaya|relax|tired/)) {
    const spa = items.find((i) => i.experienceId === "asaya-spa");
    if (spa) {
      const exp = experienceById(spa.experienceId)!;
      return {
        text: `${exp.name} is held for ${spa.slot}. The room with the cypress view is yours.`,
        stateChanged: false,
      };
    }
    return {
      text: "Asaya has openings at 11, 2, and 4 tomorrow. The 4pm tends to be quietest.",
      stateChanged: false,
    };
  }

  // ── Closing acknowledgments — short, no promised mutation ─────────────
  if (msg.match(/^\s*(thanks|thank you|thx|ty|got it|appreciate)/i)) {
    return { text: "Anytime.", stateChanged: false };
  }
  if (msg.match(/^\s*(yes|yeah|yep|sure|ok|okay|please|sounds good)\b/i)) {
    return { text: "Of course.", stateChanged: false };
  }

  // ── Default — generic but reads polite, doesn't promise anything ──────
  return {
    text: "Let me check on that. Anything in particular you'd like me to move first?",
    stateChanged: false,
  };
}

function shiftedSlot(slot: string): string {
  // Tiny helper so a "move" always produces a visibly different slot label.
  const m = slot.match(/^(\w+)\s+(\d{1,2}):?(\d{2})?(am|pm)$/i);
  if (!m) return slot + " (later)";
  const day = m[1];
  let hour = parseInt(m[2], 10);
  const min = m[3] || "00";
  const ampm = m[4].toLowerCase();
  // Shift by 2 hours, simple wrap.
  hour = ((hour + 2 - 1) % 12) + 1;
  return `${day} ${hour}:${min}${ampm}`;
}

export { MOCK as IS_MOCK };
