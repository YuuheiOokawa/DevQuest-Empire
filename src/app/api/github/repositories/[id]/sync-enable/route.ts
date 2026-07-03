import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  syncEnabled: z.boolean(),
  privateConsent: z.boolean().optional(),
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
  const { syncEnabled, privateConsent } = parsed.data;

  const repository = await prisma.githubRepository.findUnique({
    where: { id },
  });
  if (!repository) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (repository.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const nextPrivateConsent = privateConsent ?? repository.privateConsent;
  if (repository.isPrivate && syncEnabled && !nextPrivateConsent) {
    return NextResponse.json(
      { error: "private_consent_required" },
      { status: 400 }
    );
  }

  const updated = await prisma.githubRepository.update({
    where: { id },
    data: {
      syncEnabled,
      privateConsent: nextPrivateConsent,
    },
  });

  return NextResponse.json({
    id: updated.id,
    syncEnabled: updated.syncEnabled,
    privateConsent: updated.privateConsent,
  });
}
