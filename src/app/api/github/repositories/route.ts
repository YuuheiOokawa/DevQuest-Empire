import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRepositoriesForUser } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const repositories = await getRepositoriesForUser(session.user.id);
    return NextResponse.json(repositories);
  } catch {
    return NextResponse.json(
      { error: "github_api_error" },
      { status: 502 }
    );
  }
}
