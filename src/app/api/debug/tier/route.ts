// 検証用の一時的な管理者APIルート。tierの見た目確認が終わり次第削除予定。
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDebugAdmin } from "@/lib/game/debugAdmin";
import { MAX_TIER } from "@/lib/game/settlement";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isDebugAdmin(session.user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const rawTier = body?.tier;

  let tier: number | null;
  if (rawTier === null) {
    tier = null;
  } else {
    tier = Number(rawTier);
    if (!Number.isInteger(tier) || tier < 1 || tier > MAX_TIER) {
      return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
    }
  }

  await prisma.player.update({
    where: { userId: session.user.id },
    data: { debugTierOverride: tier },
  });

  return NextResponse.json({ tier });
}
