import { NextRequest, NextResponse } from "next/server";
import { handleToolCall } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    itemId: string;
    outcome: "stamped" | "banked";
    photoUrl?: string;
  };
  const result = handleToolCall("redeem_experience", {
    itemId: body.itemId,
    outcome: body.outcome,
    ...(body.photoUrl ? { photoUrl: body.photoUrl } : {}),
  });
  return NextResponse.json(result);
}
