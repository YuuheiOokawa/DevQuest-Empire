import { redirect } from "next/navigation";
import { Trophy, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAchievementsView } from "@/lib/game/achievements";
import { AppNav } from "@/components/layout/AppNav";
import { Card, CardContent } from "@/components/ui/card";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const achievements = await getAchievementsView(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">実績</h1>
        <p className="text-muted-foreground text-sm">
          GitHub活動の積み重ねで解放されていきます。
        </p>
      </div>

      {!achievements ? (
        <p className="text-destructive text-sm">実績情報を取得できませんでした。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <Card
              key={achievement.type}
              className={achievement.unlocked ? "" : "opacity-50 grayscale"}
            >
              <CardContent className="flex items-start gap-3 py-4">
                {achievement.unlocked ? (
                  <Trophy className="text-primary mt-0.5 size-5 shrink-0" />
                ) : (
                  <Lock className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{achievement.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {achievement.condition}
                  </span>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-muted-foreground text-xs">
                      達成日:{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </main>
    </>
  );
}
