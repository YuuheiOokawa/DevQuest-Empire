import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { completeQuest } from "@/lib/game/quest";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // 挑戦モード(easy/normal/hard)。ボディ無し・不正値はnormal扱い。
  const body = (await request.json().catch(() => ({}))) as { mode?: string };
  const mode = ["easy", "normal", "hard"].includes(body.mode ?? "") ? body.mode! : "normal";

  try {
    const result = await completeQuest(session.user.id, id, mode);
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
