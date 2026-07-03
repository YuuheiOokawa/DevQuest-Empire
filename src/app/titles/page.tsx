import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTitlesView } from "@/lib/game/titles";
import { AppNav } from "@/components/layout/AppNav";
import { TitleList } from "@/components/titles/TitleList";

export default async function TitlesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const titles = await getTitlesView(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">称号</h1>
          <p className="text-muted-foreground text-sm">
            レベルアップで新しい称号が解放されます。装着する称号を選べます。
          </p>
        </div>

        {!titles ? (
          <p className="text-destructive text-sm">称号情報を取得できませんでした。</p>
        ) : (
          <TitleList
            initialTitles={titles.map((t) => ({
              ...t,
              unlockedAt: t.unlockedAt ? t.unlockedAt.toISOString() : null,
            }))}
          />
        )}
      </main>
    </>
  );
}
