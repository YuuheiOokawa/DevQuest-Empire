import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncGithubForUser } from "@/lib/sync/syncGithub";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGithubForUser(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("github sync failed", err);
    return NextResponse.json({ error: "sync_failed" }, { status: 502 });
  }
}
