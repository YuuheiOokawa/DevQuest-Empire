import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAchievementsView } from "@/lib/game/achievements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const achievements = await getAchievementsView(session.user.id);
  if (!achievements) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(achievements);
}
