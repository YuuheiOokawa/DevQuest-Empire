import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivitySummary } from "@/lib/game/activity";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await getActivitySummary(session.user.id);
  return NextResponse.json(summary);
}
