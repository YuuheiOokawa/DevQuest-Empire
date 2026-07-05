import { UserPlus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GACHA_RATES } from "@/data/personaTemplates";
import { GACHA_COST, MAX_EMPLOYEES } from "@/services/recruitmentService";

export function RecruitGachaCard({
  funds,
  employeeCount,
  onRecruit,
}: {
  funds: number;
  employeeCount: number;
  onRecruit: () => void;
}) {
  const atCap = employeeCount >= MAX_EMPLOYEES;
  const canAfford = funds >= GACHA_COST;
  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:border-violet-900 dark:from-violet-950/30 dark:to-fuchsia-950/20">
      <CardContent className="flex flex-col gap-3 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <UserPlus className="text-primary size-4" />
          AI社員を採用する
        </h3>
        <p className="text-muted-foreground text-xs">
          採用エージェントに依頼して新しいAI社員を1人採用します。誰が来るかはお楽しみ
          (レアリティ: {GACHA_RATES.map((r) => r.rarity).join(" / ")})。
        </p>
        <div className="flex flex-wrap gap-1">
          {GACHA_RATES.map((r) => (
            <span key={r.rarity} className="bg-background/70 rounded-full border px-1.5 py-0.5 text-[9px]">
              {r.rarity} {r.rate}%
            </span>
          ))}
        </div>
        <Button
          onClick={onRecruit}
          disabled={atCap || !canAfford}
          className="gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600"
        >
          <Sparkles className="size-4" />
          採用する({GACHA_COST.toLocaleString()}円)
        </Button>
        {atCap && (
          <p className="text-destructive text-xs">社員数が上限({MAX_EMPLOYEES}人)に達しています</p>
        )}
        {!atCap && !canAfford && <p className="text-destructive text-xs">資金が足りません</p>}
      </CardContent>
    </Card>
  );
}
