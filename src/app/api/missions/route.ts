import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMissionsView } from "@/lib/game/missions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const missions = await getMissionsView(session.user.id);
  if (!missions) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(missions);
}
