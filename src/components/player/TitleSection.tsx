import { TitleList, type TitleItem } from "@/components/titles/TitleList";
import { Progress } from "@/components/ui/progress";

export function TitleSection({ titles }: { titles: TitleItem[] | null }) {
  if (!titles) {
    return (
      <p className="text-destructive text-sm">称号情報を取得できませんでした。</p>
    );
  }

  const unlockedCount = titles.filter((t) => t.unlocked).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">称号コレクション</span>
          <span className="text-muted-foreground">
            {unlockedCount} / {titles.length}
          </span>
        </div>
        <Progress value={(unlockedCount / titles.length) * 100} />
      </div>

      <TitleList initialTitles={titles} />
    </div>
  );
}
