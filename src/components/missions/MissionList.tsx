"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type MissionItem = {
  id: string;
  name: string;
  description: string;
  period: string;
  progressValue: number;
  targetValue: number;
  expReward: number;
  claimed: boolean;
  claimable: boolean;
};

export function MissionList({
  title,
  initialMissions,
}: {
  title: string;
  initialMissions: MissionItem[];
}) {
  const router = useRouter();
  const [missions, setMissions] = useState(initialMissions);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim(missionId: string) {
    setPendingId(missionId);
    setError(null);
    try {
      const res = await fetch(`/api/missions/${missionId}/claim`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("受け取りに失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true, claimable: false } : m))
      );
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (missions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <CardContent className="flex flex-col gap-2 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-medium">
                  {mission.name}
                </span>
                <Badge variant="secondary" className="shrink-0">
                  +{mission.expReward}EXP
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {mission.description}
              </p>
              <Progress
                value={(mission.progressValue / mission.targetValue) * 100}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  {mission.progressValue} / {mission.targetValue}
                </span>
                {mission.claimed ? (
                  <Badge>受取済み</Badge>
                ) : mission.claimable ? (
                  <Button
                    size="sm"
                    disabled={pendingId === mission.id}
                    onClick={() => handleClaim(mission.id)}
                  >
                    受け取る
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
