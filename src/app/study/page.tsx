import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudySummary } from "@/lib/game/study";
import { AppNav } from "@/components/layout/AppNav";
import { StudyLogForm } from "@/components/study/StudyLogForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const summary = await getStudySummary(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">学習記録</h1>
          <p className="text-muted-foreground text-sm">
            学習時間10分あたり5EXPを獲得できます。
          </p>
        </div>

        {!summary ? (
          <p className="text-destructive text-sm">学習記録を取得できませんでした。</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-sm">累計学習時間</p>
                  <p className="text-xl font-bold">{summary.totalMinutes}分</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-sm">直近7日間</p>
                  <p className="text-xl font-bold">{summary.last7DaysMinutes}分</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="py-4">
                <StudyLogForm />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">記録履歴</h2>
              {summary.logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  まだ記録がありません。
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {summary.logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="flex flex-col gap-1 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate font-medium">
                            {log.title}
                          </span>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {log.minutes}分 ・ +{log.expAwarded}EXP
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{log.category}</span>
                          <span>
                            {new Date(log.recordedAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-muted-foreground text-sm">
                            {log.note}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
