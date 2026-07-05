import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { AppShell } from "@/components/layout/AppShell";

// TopBar/FooterNavをこのグループ配下の全ページで共有するレイアウト。
// Next.jsのApp Routerはレイアウトをナビゲーション間で保持したまま
// ページ部分のみを差し替えるため、タブ切り替え時にナビゲーション自体が
// アンマウント/再マウントされて画面全体がローディング表示に切り替わる
// ことがなくなる(各ページのloading.tsxはこのレイアウトの子要素のみを覆う)。
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const player = await prisma.player.findUniqueOrThrow({
    where: { userId: session.user.id },
  });
  const { level } = recalcLevel(player.exp);

  return <AppShell initialLevel={level}>{children}</AppShell>;
}
