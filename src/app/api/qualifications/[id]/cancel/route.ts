import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resetQualification } from "@/lib/game/qualifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await resetQualification(session.user.id, id);
  return NextResponse.json({ ok: true });
}
