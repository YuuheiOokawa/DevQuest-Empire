"use client";

// 検証用の一時的な管理者UI。tierの見た目確認が終わり次第、
// このファイルと呼び出し元(village/page.tsx)のマウント箇所ごと削除予定。

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TIERS = [1, 2, 3, 4, 5, 6] as const;

export function DebugTierPanel({
  currentTier,
  isOverridden,
}: {
  currentTier: number;
  isOverridden: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<number | "reset" | null>(null);

  async function setTier(tier: number | null) {
    setPending(tier ?? "reset");
    try {
      await fetch("/api/debug/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <Card className="border-dashed border-fuchsia-400 bg-fuchsia-50/60 dark:border-fuchsia-800 dark:bg-fuchsia-950/30">
      <CardContent className="flex flex-wrap items-center gap-2 py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300">
          <FlaskConical className="size-3.5" />
          DEBUG: tierプレビュー(管理者のみ・後で削除)
        </span>
        {TIERS.map((tier) => (
          <Button
            key={tier}
            type="button"
            size="sm"
            variant={currentTier === tier && isOverridden ? "default" : "outline"}
            disabled={pending !== null}
            onClick={() => setTier(tier)}
          >
            {pending === tier ? "..." : `Tier ${tier}`}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending !== null || !isOverridden}
          onClick={() => setTier(null)}
        >
          {pending === "reset" ? "..." : "実データに戻す"}
        </Button>
      </CardContent>
    </Card>
  );
}
