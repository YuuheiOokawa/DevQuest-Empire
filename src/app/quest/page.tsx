import { redirect } from "next/navigation";
import { Scroll } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrCreateTodaysQuest, getRecentQuestHistory } from "@/lib/game/quest";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompleteQuestButton } from "@/components/quest/CompleteQuestButton";
import { AppNav } from "@/components/layout/AppNav";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "かんたん",
  medium: "ふつう",
  hard: "むずかしい",
};

export default async function QuestPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [todaysQuest, history] = await Promise.all([
    getOrCreateTodaysQuest(session.user.id),
    getRecentQuestHistory(session.user.id),
  ]);

  const pastQuests = history.filter((q) => q.id !== todaysQuest.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Scroll className="text-primary size-6" />
          今日のクエスト
        </h1>
        <p className="text-muted-foreground text-sm">
          直近のGitHub活動をもとにAIが提案します。
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-medium">{todaysQuest.title}</span>
            <Badge variant="secondary" className="shrink-0">
              {DIFFICULTY_LABEL[todaysQuest.difficulty] ?? todaysQuest.difficulty} ・
              +{todaysQuest.expReward}EXP
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {todaysQuest.description}
          </p>
          {todaysQuest.status === "completed" ? (
            <Badge>達成済み</Badge>
          ) : (
            <CompleteQuestButton questId={todaysQuest.id} />
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">過去7日間の履歴</h2>
        {pastQuests.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだ履歴がありません。</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pastQuests.map((quest) => (
              <Card key={quest.id}>
                <CardContent className="flex items-center justify-between gap-2 py-3">
                  <span className="min-w-0 truncate text-sm">{quest.title}</span>
                  <Badge
                    variant={quest.status === "completed" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {quest.status === "completed" ? "達成済み" : "未達成"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </main>
    </>
  );
}
