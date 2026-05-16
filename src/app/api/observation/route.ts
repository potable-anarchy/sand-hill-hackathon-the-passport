import { NextRequest, NextResponse } from "next/server";
import { setState } from "@/lib/state";
import { structureObservation } from "@/lib/observations";
import type { StaffObservation } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    text: string;
    guestId?: string;
    staffMember?: string;
  };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const structured = await structureObservation(text);
  const obs: StaffObservation = {
    id: `obs-${Date.now()}`,
    text,
    structured,
    guestId: body.guestId || "g-demo",
    staffMember: body.staffMember || "staff",
    capturedAt: new Date().toISOString(),
  };

  const state = setState((s) => {
    s.guest.observations.push(obs);
  });

  return NextResponse.json({ observation: obs, profile: state.guest });
}
