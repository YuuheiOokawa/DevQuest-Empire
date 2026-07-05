"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skull, Swords, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { missionIcon } from "@/lib/game/rewardIcons";
import { useLevelUp } from "@/components/levelup/LevelUpContext";
import type { MissionItem } from "@/components/missions/MissionList";

// ボスは週替わりの高難度ミッション(missions.tsのperiod="boss")を
// 「討伐対象」として見せるための専用UI。バックエンドは通常ミッションと
// 共通(/api/missions/[id]/claim)で、表示のみHPバー風に変える。
export function BossSection({ bosses }: { bosses: MissionItem[] }) {
  const router = useRouter();
  const reportGrowthResult = useLevelUp();
  const [items, setItems] = useState(bosses);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim(bossId: string) {
    setPendingId(bossId);
    setError(null);
    try {
      const res = await fetch(`/api/missions/${bossId}/claim`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        setError("討伐報酬の受け取りに失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setItems((prev) =>
        prev.map((b) => (b.id === bossId ? { ...b, claimed: true, claimable: false } : b))
      );
      reportGrowthResult(result);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <p className="text-muted-foreground text-sm">
            現在挑戦できるボスはいません。
          </p>
          <Badge variant="secondary" className="shrink-0">
            準備中
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-destructive text-sm">{error}</p>}
      {items.map((boss) => {
        const Icon = missionIcon(boss.metric);
        const remainingHp = Math.max(boss.targetValue - boss.progressValue, 0);
        const hpRate = Math.max(
          0,
          Math.min(100, (remainingHp / boss.targetValue) * 100)
        );
        const defeated = boss.claimed || boss.claimable;

        return (
          <Card
            key={boss.id}
            className={
              boss.claimed
                ? "border-muted opacity-70"
                : boss.claimable
                  ? "border-red-400 shadow-md shadow-red-500/20 dark:border-red-700"
                  : "border-red-200 dark:border-red-900"
            }
          >
            <CardContent className="flex flex-col gap-2.5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={
                    boss.claimed
                      ? "bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full"
                      : "flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-md shadow-red-500/40"
                  }
                >
                  {boss.claimed ? (
                    <Trophy className="size-5" />
                  ) : (
                    <Skull className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate font-semibold">{boss.name}</span>
                    <Badge className="shrink-0 gap-1 bg-red-600 text-white hover:bg-red-600">
                      +{boss.expReward}EXP
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{boss.description}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Icon className="size-3" />
                    残りHP
                  </span>
                  <span className="text-muted-foreground">
                    {defeated ? 0 : remainingHp} / {boss.targetValue}
                  </span>
                </div>
                <Progress
                  value={defeated ? 0 : hpRate}
                  className="h-2 [&_[data-slot=progress-indicator]]:bg-red-500"
                />
              </div>

              <div className="flex justify-end">
                {boss.claimed ? (
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="size-3" />
                    討伐済み
                  </Badge>
                ) : boss.claimable ? (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
                    disabled={pendingId === boss.id}
                    onClick={() => handleClaim(boss.id)}
                  >
                    <Swords className="size-4" />
                    討伐報酬を受け取る
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
