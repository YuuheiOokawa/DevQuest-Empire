import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  startLearning,
  holdQualification,
  markQualificationFailed,
} from "@/lib/game/qualifications";

const bodySchema = z.object({
  status: z.enum(["learning", "on_hold", "failed"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    switch (parsed.data.status) {
      case "learning":
        await startLearning(session.user.id, id);
        break;
      case "on_hold":
        await holdQualification(session.user.id, id);
        break;
      case "failed":
        await markQualificationFailed(session.user.id, id);
        break;
    }
    return NextResponse.json({ ok: true });
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
