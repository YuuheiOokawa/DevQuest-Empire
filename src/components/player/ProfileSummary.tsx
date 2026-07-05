import { SettlementBadge } from "@/components/village/SettlementBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SettlementInfo } from "@/lib/game/settlement";

export function ProfileSummary({
  name,
  equippedTitle,
  settlement,
  level,
  companyRank,
  currentExp,
  expToNextLevel,
}: {
  name: string;
  equippedTitle: string | null;
  settlement: SettlementInfo | null;
  level: number;
  companyRank: string;
  currentExp: number;
  expToNextLevel: number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5">
        <div className="flex items-center gap-4">
          {settlement && <SettlementBadge tier={settlement.tier} size="lg" />}
          <div className="min-w-0 flex-1">
            {equippedTitle && (
              <p className="text-primary truncate text-xs font-medium">
                {equippedTitle}
              </p>
            )}
            <h2 className="truncate text-xl font-bold">{name}</h2>
            <p className="text-muted-foreground text-sm">
              {settlement?.roleName ?? "村の青年"} ・ Lv.{level} ・ {companyRank}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">経験値</span>
            <span className="text-muted-foreground">
              {currentExp} / {expToNextLevel} EXP
            </span>
          </div>
          <Progress value={(currentExp / expToNextLevel) * 100} />
        </div>
      </CardContent>
    </Card>
  );
}
