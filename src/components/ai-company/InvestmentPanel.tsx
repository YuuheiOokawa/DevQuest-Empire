import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INVESTMENT_DEFS } from "@/data/techTree";
import { investmentUpgradeCost } from "@/services/techTreeService";
import type { Investments, InvestmentKind } from "@/services/aiCompanyTypes";

export function InvestmentPanel({
  investments,
  funds,
  onUpgrade,
}: {
  investments: Investments;
  funds: number;
  onUpgrade: (kind: InvestmentKind) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <TrendingUp className="text-primary size-4" />
          経営投資
        </h3>
        <div className="flex flex-col gap-2">
          {INVESTMENT_DEFS.map((def) => {
            const level = investments[def.kind];
            const maxed = level >= def.maxLevel;
            const cost = maxed ? 0 : investmentUpgradeCost(def.kind, level);
            return (
              <div key={def.kind} className="flex items-center gap-2 rounded-xl border p-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{def.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      Lv.{level}/{def.maxLevel}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">{def.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs"
                  disabled={maxed || funds < cost}
                  onClick={() => onUpgrade(def.kind)}
                >
                  {maxed ? "MAX" : `${cost.toLocaleString()}円`}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
