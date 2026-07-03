import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateTodaysQuest } from "@/lib/game/quest";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const quest = await getOrCreateTodaysQuest(session.user.id);
  return NextResponse.json(quest);
}
