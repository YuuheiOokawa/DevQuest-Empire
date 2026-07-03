import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { planQualification } from "@/lib/game/qualifications";

const bodySchema = z.object({
  examDate: z.string().min(1),
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
    await planQualification(session.user.id, id, parsed.data.examDate);
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
