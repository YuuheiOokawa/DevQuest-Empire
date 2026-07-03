"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type TitleItem = {
  id: string;
  type: string;
  name: string;
  condition: string;
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
      {titles.map((title) => (
        <Card
          key={title.id}
          className={title.unlocked ? "" : "opacity-50 grayscale"}
        >
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div className="flex min-w-0 items-center gap-3">
              {title.unlocked ? (
                <Award className="text-primary size-5 shrink-0" />
              ) : (
                <Lock className="text-muted-foreground size-5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{title.name}</p>
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
      ))}
    </div>
  );
}
