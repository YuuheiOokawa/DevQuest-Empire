"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginBonusCard({
  claimedToday,
  streak,
  todayReward,
}: {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [claimed, setClaimed] = useState(claimedToday);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/login-bonus/claim", { method: "POST" });
      if (!res.ok) {
        setError("受け取りに失敗しました。時間をおいて再度お試しください。");
        return;
      }
      setClaimed(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Gift className="text-primary size-6 shrink-0" />
          <div>
            <p className="font-semibold">
              {claimed ? "本日のログインボーナス受取済み" : "ログインボーナス"}
            </p>
            <p className="text-muted-foreground text-sm">
              {streak}日連続 ・ +{todayReward}EXP
            </p>
          </div>
        </div>
        {!claimed && (
          <Button onClick={handleClaim} disabled={pending} size="sm">
            {pending ? "受取中..." : "受け取る"}
          </Button>
        )}
      </CardContent>
      {error && <p className="text-destructive px-4 pb-3 text-sm">{error}</p>}
    </Card>
  );
}
