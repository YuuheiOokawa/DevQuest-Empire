"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { missionIcon } from "@/lib/game/rewardIcons";
import { formatGrowthNotifications } from "@/lib/game/notifications";

export type MissionItem = {
  id: string;
  name: string;
  description: string;
  period: string;
  metric: string;
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
  const [notifications, setNotifications] = useState<Record<string, string[]>>(
    {}
  );

  async function handleClaim(missionId: string) {
    setPendingId(missionId);
    setError(null);
    try {
      const res = await fetch(`/api/missions/${missionId}/claim`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) {
        setError("受け取りに失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true, claimable: false } : m))
      );
      setNotifications((prev) => ({
        ...prev,
        [missionId]: formatGrowthNotifications(result),
      }));
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (missions.length === 0) return null;

  const claimedCount = missions.filter((m) => m.claimed).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-muted-foreground text-xs">
          {claimedCount} / {missions.length} 受取済み
        </span>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex flex-col gap-2">
        {missions.map((mission) => {
          const Icon = missionIcon(mission.metric);
          return (
            <Card
              key={mission.id}
              className={
                mission.claimed
                  ? "opacity-60"
                  : mission.claimable
                    ? "ring-2 ring-amber-400/70 shadow-md shadow-amber-500/10"
                    : ""
              }
            >
              <CardContent className="flex flex-col gap-2 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      mission.claimed
                        ? "bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full"
                        : "bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                    }
                  >
                    {mission.claimed ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
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
                  </div>
                </div>
                <Progress
                  value={(mission.progressValue / mission.targetValue) * 100}
                  className={
                    mission.claimable
                      ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                      : ""
                  }
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    {mission.progressValue} / {mission.targetValue}
                  </span>
                  {mission.claimed ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="size-3" />
                      受取済み
                    </Badge>
                  ) : mission.claimable ? (
                    <Button
                      size="sm"
                      className="bg-amber-500 text-white hover:bg-amber-600"
                      disabled={pendingId === mission.id}
                      onClick={() => handleClaim(mission.id)}
                    >
                      受け取る
                    </Button>
                  ) : null}
                </div>
                {notifications[mission.id]?.map((line) => (
                  <p key={line} className="text-primary text-xs font-medium">
                    {line}
                  </p>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
