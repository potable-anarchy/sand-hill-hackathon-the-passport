/**
 * Claude agent wrapper.
 * - MOCK_MODE=true → returns deterministic responses (works without API key)
 * - MOCK_MODE=false → calls Claude with tool-use
 */

import Anthropic from "@anthropic-ai/sdk";
import { TOOL_SCHEMAS, handleToolCall, deterministicItinerary } from "./tools";
import type { PassportItem } from "./types";
import { CONCIERGE, EXPERIENCES } from "./property-catalog";

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

function mockConciergeReply(guestMessage: string): ConciergeReply {
  const msg = guestMessage.toLowerCase();

  if (msg.match(/move|change|swap.*hike|reschedule/)) {
    return {
      text: "Done. Spa at 5, hike at 7 tomorrow morning.",
      stateChanged: true,
    };
  }
  if (msg.match(/dinner|hungry|tired|tonight/)) {
    return {
      text: "Madera's tasting is the move tonight — I can hold a quieter corner if you'd like. The bar is open later if you'd rather keep it lighter.",
      stateChanged: false,
    };
  }
  if (msg.match(/wine|pair|sommelier/)) {
    return {
      text: "Sofia at Madera has the Ridge pairing tonight. I'll let her know you're coming so she can walk you through it after the third course.",
      stateChanged: false,
    };
  }
  if (msg.match(/yes|sure|ok|please|sounds good/)) {
    return {
      text: "Done.",
      stateChanged: true,
    };
  }
  if (msg.match(/spa|massage|asaya/)) {
    return {
      text: "Asaya has openings at 11, 2, and 4 tomorrow. The 4pm tends to be the quietest — therapist's choice on the 10-minute add-on.",
      stateChanged: false,
    };
  }
  return {
    text: "Of course — give me a moment.",
    stateChanged: false,
  };
}

export { MOCK as IS_MOCK };
