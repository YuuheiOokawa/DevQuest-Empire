import { FlaskConical, Check, Lock, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TECH_TREE } from "@/data/techTree";
import type { GameState } from "@/services/aiCompanyTypes";

export function TechTreePanel({
  state,
  onResearch,
}: {
  state: GameState;
  onResearch: (nodeId: string) => void;
}) {
  const { research, company } = state;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <FlaskConical className="text-primary size-4" />
          技術ツリー
        </h3>
        <div className="flex flex-col gap-2">
          {TECH_TREE.map((node) => {
            const done = research.completed.includes(node.id);
            const inProgress = research.current?.nodeId === node.id;
            const locked = node.requires !== null && !research.completed.includes(node.requires);
            const busy = research.current !== null;
            return (
              <div
                key={node.id}
                className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                  done ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{node.name}</span>
                    {done && <Check className="size-3.5 text-emerald-500" />}
                    {inProgress && (
                      <span className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400">
                        <LoaderCircle className="size-3 animate-spin" />
                        あと{research.current!.remaining}ターン
                      </span>
                    )}
                    {locked && !done && <Lock className="text-muted-foreground size-3" />}
                  </div>
                  <p className="text-muted-foreground text-[10px]">{node.description}</p>
                  {node.requires && !done && (
                    <p className="text-muted-foreground text-[9px]">
                      前提: {TECH_TREE.find((n) => n.id === node.requires)?.name}
                    </p>
                  )}
                </div>
                {!done && !inProgress && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs"
                    disabled={locked || busy || company.funds < node.cost}
                    onClick={() => onResearch(node.id)}
                  >
                    {node.cost.toLocaleString()}円
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
