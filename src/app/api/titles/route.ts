import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTitlesView } from "@/lib/game/titles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const titles = await getTitlesView(session.user.id);
  if (!titles) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(titles);
}
