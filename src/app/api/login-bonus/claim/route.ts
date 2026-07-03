import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimLoginBonus } from "@/lib/game/loginBonus";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await claimLoginBonus(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    const statusCode =
      err instanceof Error && "statusCode" in err
        ? (err as Error & { statusCode: number }).statusCode
        : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: statusCode }
    );
  }
}
