import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVillageBuildingsView } from "@/lib/game/buildings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const buildings = await getVillageBuildingsView(session.user.id);
  if (!buildings) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(buildings);
}
