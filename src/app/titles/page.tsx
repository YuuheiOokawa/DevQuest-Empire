import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTitlesView } from "@/lib/game/titles";
import { AppNav } from "@/components/layout/AppNav";
import { TitleList } from "@/components/titles/TitleList";
import { Progress } from "@/components/ui/progress";

export default async function TitlesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const titles = await getTitlesView(session.user.id);
  const unlockedCount = titles?.filter((t) => t.unlocked).length ?? 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Award className="text-primary size-6" />
            称号
          </h1>
          <p className="text-muted-foreground text-sm">
            レベル・継続・学習・資格・村の発展で新しい称号が解放されます。装着する称号を選べます。
          </p>
        </div>

        {!titles ? (
          <p className="text-destructive text-sm">称号情報を取得できませんでした。</p>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">称号コレクション</span>
                <span className="text-muted-foreground">
                  {unlockedCount} / {titles.length}
                </span>
              </div>
              <Progress value={(unlockedCount / titles.length) * 100} />
            </div>

            <TitleList
              initialTitles={titles.map((t) => ({
                ...t,
                unlockedAt: t.unlockedAt ? t.unlockedAt.toISOString() : null,
              }))}
            />
          </>
        )}
      </main>
    </>
  );
}
