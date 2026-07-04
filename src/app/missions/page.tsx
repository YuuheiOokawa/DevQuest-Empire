import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { auth } from "@/lib/auth";
import { getMissionsView } from "@/lib/game/missions";
import { AppNav } from "@/components/layout/AppNav";
import { MissionList } from "@/components/missions/MissionList";
import { Card, CardContent } from "@/components/ui/card";

export default async function MissionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const missions = await getMissionsView(session.user.id);
  const claimableCount = missions?.filter((m) => m.claimable).length ?? 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Target className="text-primary size-6" />
            ミッション
          </h1>
          <p className="text-muted-foreground text-sm">
            GitHub活動・学習の目標を達成して追加の経験値を受け取りましょう。
          </p>
        </div>

        {!missions ? (
          <p className="text-destructive text-sm">
            ミッション情報を取得できませんでした。
          </p>
        ) : (
          <>
            {claimableCount > 0 && (
              <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                <CardContent className="py-3 text-center text-sm font-medium text-amber-700 dark:text-amber-300">
                  受け取り可能なミッションが{claimableCount}件あります
                </CardContent>
              </Card>
            )}
            <MissionList
              title="デイリー"
              initialMissions={missions.filter((m) => m.period === "daily")}
            />
            <MissionList
              title="ウィークリー"
              initialMissions={missions.filter((m) => m.period === "weekly")}
            />
          </>
        )}
      </main>
    </>
  );
}
