import { GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityHeatmap } from "@/components/github/ActivityHeatmap";
import type { ActivitySummary } from "@/lib/game/activity";
import type { ActivityCounts, ActivityHeatmapDay } from "@/services/githubService";

export function GithubAnalysisCard({
  activity,
  last30Days,
  heatmap,
}: {
  activity: ActivitySummary;
  last30Days: ActivityCounts;
  heatmap: ActivityHeatmapDay[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <GitBranch className="text-primary size-4" />
          GitHub活動分析
        </h3>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>7日: Commit {activity.last7Days.commits} / Issue {activity.last7Days.issues} / PR {activity.last7Days.prs}</span>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>30日: Commit {last30Days.commits} / Issue {last30Days.issues} / PR {last30Days.prs}</span>
        </div>
        <ActivityHeatmap days={heatmap} />
        <p className="text-sm">{activity.aiComment}</p>
      </CardContent>
    </Card>
  );
}
