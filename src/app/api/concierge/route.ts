/**
 * Concierge chat endpoint.
 * Routes guest messages through Claude (or mock fallback) via `conciergeReply()`,
 * persists both sides of the exchange to state, returns the reply for the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { conciergeReply } from "@/lib/agent";
import { getState, setState } from "@/lib/state";
import type { ChatMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { message: string };
  const guestText = body.message?.trim();
  if (!guestText) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const now = () => new Date().toISOString();

  // Capture history BEFORE writing the current guest message.
  const history = getState().messages.map((m) => ({
    role: m.role === "guest" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));

  // Persist guest message immediately so a state refresh shows it.
  setState((s) => {
    const msg: ChatMessage = {
      id: `m-${Date.now()}-g`,
      role: "guest",
      text: guestText,
      timestamp: now(),
    };
    s.messages.push(msg);
  });

  // Call the agent (Claude with tool-use, or deterministic mock).
  const reply = await conciergeReply(guestText, history);

  // Persist James's reply.
  const jamesMsg: ChatMessage = {
    id: `m-${Date.now()}-j`,
    role: "concierge",
    text: reply.text,
    timestamp: now(),
  };
  setState((s) => {
    s.messages.push(jamesMsg);
  });

  return NextResponse.json({
    reply: reply.text,
    stateChanged: reply.stateChanged,
    messageId: jamesMsg.id,
  });
}
