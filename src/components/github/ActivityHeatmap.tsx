import type { ActivityHeatmapDay } from "@/services/githubService";

const LEVEL_COLORS = [
  "bg-muted",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-600 dark:bg-emerald-500",
];

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

/** GitHubのコントリビューショングラフ風に、日別コミット数を週ごとの列で表示する。 */
export function ActivityHeatmap({ days }: { days: ActivityHeatmapDay[] }) {
  const weeks: ActivityHeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto py-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count}件`}
              className={`size-2.5 shrink-0 rounded-sm ${LEVEL_COLORS[levelFor(day.count)]}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
