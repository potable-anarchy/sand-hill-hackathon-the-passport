/**
 * Structures unstructured staff observations into guest profile fields.
 * MOCK_MODE returns a simple keyword-based extraction.
 */

import Anthropic from "@anthropic-ai/sdk";
import { IS_MOCK } from "./agent";

const client = IS_MOCK
  ? null
  : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function structureObservation(text: string): Promise<Record<string, string>> {
  if (IS_MOCK || !client) {
    return mockStructure(text);
  }

  const systemPrompt = `You convert unstructured guest observations (notes typed by hotel staff) into structured JSON fields. Return ONLY a JSON object — no commentary, no markdown fence.

Fields to extract when relevant: family_event, family_member, preference, dietary, allergy, anniversary, return_trip_signal, location_mentioned, date_mentioned, mood, interest. Use snake_case. Be conservative — only include fields you have strong evidence for.

Example:
Input: "Marcie mentioned her sister's wedding in Sonoma next May"
Output: {"family_event": "sister wedding", "location_mentioned": "Sonoma", "date_mentioned": "May 2027"}

Now extract from: ${text}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{ role: "user", content: systemPrompt }],
  });

  const reply = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");

  const jsonMatch = reply.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return mockStructure(text);
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return mockStructure(text);
  }
}

function mockStructure(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lower = text.toLowerCase();

  // Family events
  if (lower.match(/wedding/)) out.family_event = "wedding";
  if (lower.match(/anniversary/)) out.family_event = "anniversary";
  if (lower.match(/birthday/)) out.family_event = "birthday";

  // Family members
  const familyMatch = lower.match(/\b(sister|brother|partner|spouse|wife|husband|son|daughter|mother|father|mom|dad)\b/);
  if (familyMatch) out.family_member = familyMatch[1];

  // Locations
  const locationMatch = text.match(/\b(Sonoma|Napa|Hong Kong|Mayakoba|Tokyo|Paris|London|New York|NYC|Bangkok|Phuket|Calistoga|Menlo Park|Bay Area)\b/);
  if (locationMatch) out.location_mentioned = locationMatch[1];

  // Dates
  const monthMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b(?:\s+\d{4})?/);
  if (monthMatch) out.date_mentioned = monthMatch[0];

  // Dietary
  if (lower.match(/vegan|vegetarian/)) out.dietary = "vegetarian/vegan";
  if (lower.match(/gluten/)) out.dietary = "gluten sensitive";
  if (lower.match(/allerg/)) out.allergy = "see note";

  // Preferences
  if (lower.match(/loves?|enjoyed/)) out.preference = "positive_signal";
  if (lower.match(/avoid|dislike|hate/)) out.preference = "avoid_signal";

  // Raw text as fallback
  out.raw = text;
  return out;
}
