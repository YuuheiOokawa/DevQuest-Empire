import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const player = await prisma.player.findUnique({
    where: { userId: session.user.id },
  });
  if (!player) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { level, currentExp, expToNextLevel } = recalcLevel(player.exp);

  return NextResponse.json({
    name: player.name,
    level,
    exp: currentExp,
    expToNextLevel,
  });
}
