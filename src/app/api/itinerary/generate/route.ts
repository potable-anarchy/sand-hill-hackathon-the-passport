import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/agent";
import { setState } from "@/lib/state";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { prompts: string[]; guestName?: string };
  const items = await generateItinerary(body.prompts || []);

  const state = setState((s) => {
    s.items = items;
    s.guest.statedIntent = body.prompts || [];
    if (body.guestName) s.guest.name = body.guestName;
  });

  return NextResponse.json({ items, guest: state.guest });
}
