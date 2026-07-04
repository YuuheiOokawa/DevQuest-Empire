import { GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivitySummary } from "@/lib/game/activity";

export function GithubAnalysisCard({ activity }: { activity: ActivitySummary }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <GitBranch className="text-primary size-4" />
          GitHub活動分析
        </h3>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>Commit {activity.last7Days.commits}</span>
          <span>Issue Close {activity.last7Days.issues}</span>
          <span>PR Merge {activity.last7Days.prs}</span>
        </div>
        <p className="text-sm">{activity.aiComment}</p>
      </CardContent>
    </Card>
  );
}
