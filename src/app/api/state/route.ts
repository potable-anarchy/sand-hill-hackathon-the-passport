import { NextResponse } from "next/server";
import { getState, resetState } from "@/lib/state";

export async function GET() {
  return NextResponse.json(getState());
}

export async function DELETE() {
  resetState();
  return NextResponse.json({ ok: true });
}
