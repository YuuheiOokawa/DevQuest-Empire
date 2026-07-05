"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RewardIcon } from "@/components/ui/reward-icon";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { titleIcon } from "@/lib/game/rewardIcons";
import { RARITY_RING_CLASS, type Rarity } from "@/lib/game/rarity";

export type TitleItem = {
  id: string;
  type: string;
  name: string;
  condition: string;
  rarity: Rarity;
  unlocked: boolean;
  unlockedAt: string | null;
  equipped: boolean;
};

export function TitleList({ initialTitles }: { initialTitles: TitleItem[] }) {
  const router = useRouter();
  const [titles, setTitles] = useState(initialTitles);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEquip(titleId: string) {
    setPendingId(titleId);
    setError(null);
    try {
      const res = await fetch(`/api/titles/${titleId}/equip`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("称号の変更に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setTitles((prev) =>
        prev.map((t) => ({ ...t, equipped: t.id === titleId }))
      );
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-destructive text-sm">{error}</p>}
      {titles.map((title) => {
        const Icon = titleIcon(title.type);
        return (
          <Card
            key={title.id}
            className={
              title.equipped
                ? "ring-primary ring-2"
                : title.unlocked
                  ? RARITY_RING_CLASS[title.rarity]
                  : "opacity-60"
            }
          >
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <RewardIcon icon={Icon} rarity={title.rarity} unlocked={title.unlocked} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{title.name}</p>
                    <RarityBadge rarity={title.rarity} className="shrink-0" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {title.condition}
                  </p>
                </div>
              </div>
              {title.equipped ? (
                <Badge className="shrink-0">装着中</Badge>
              ) : title.unlocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={pendingId === title.id}
                  onClick={() => handleEquip(title.id)}
                >
                  装着する
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
