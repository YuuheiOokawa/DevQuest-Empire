import { Trophy, Award, Target, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudyLogForm } from "@/components/study/StudyLogForm";
import type { StudySummary } from "@/lib/game/study";

const STAT_TILE_COLOR = {
  achievements: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  titles: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  missions: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  study: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  qualifications: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
} as const;

export function ActivityStatsSection({
  unlockedAchievementCount,
  achievementCount,
  unlockedTitleCount,
  titleCount,
  claimableMissionCount,
  passedQualificationCount,
  qualificationCount,
  studySummary,
}: {
  unlockedAchievementCount: number;
  achievementCount: number;
  unlockedTitleCount: number;
  titleCount: number;
  claimableMissionCount: number;
  passedQualificationCount: number;
  qualificationCount: number;
  studySummary: StudySummary | null;
}) {
  const stats = [
    {
      icon: Trophy,
      label: "実績",
      value: `${unlockedAchievementCount} / ${achievementCount}`,
      color: STAT_TILE_COLOR.achievements,
    },
    {
      icon: Award,
      label: "称号",
      value: `${unlockedTitleCount} / ${titleCount}`,
      color: STAT_TILE_COLOR.titles,
    },
    {
      icon: Target,
      label: "ミッション受取可能",
      value: `${claimableMissionCount}件`,
      color: STAT_TILE_COLOR.missions,
    },
    {
      icon: BookOpen,
      label: "累計学習時間",
      value: `${studySummary?.totalMinutes ?? 0}分`,
      color: STAT_TILE_COLOR.study,
    },
    {
      icon: GraduationCap,
      label: "資格合格",
      value: `${passedQualificationCount} / ${qualificationCount}`,
      color: STAT_TILE_COLOR.qualifications,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="truncate font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {studySummary && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="py-4">
                <p className="text-muted-foreground text-sm">累計学習時間</p>
                <p className="text-xl font-bold">{studySummary.totalMinutes}分</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-muted-foreground text-sm">直近7日間</p>
                <p className="text-xl font-bold">
                  {studySummary.last7DaysMinutes}分
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="py-4">
              <StudyLogForm />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">学習記録履歴</h3>
            {studySummary.logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                まだ記録がありません。
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {studySummary.logs.map((log) => (
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
                        <p className="text-muted-foreground text-sm">{log.note}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
