"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLevelUp } from "@/components/levelup/LevelUpContext";

type QuestMode = "easy" | "normal" | "hard";

const MODES: { id: QuestMode; label: string; mult: string; desc: string }[] = [
  { id: "easy", label: "かんたん", mult: "×0.8", desc: "軽めに達成" },
  { id: "normal", label: "ふつう", mult: "×1.0", desc: "通常どおり" },
  { id: "hard", label: "むずかしい", mult: "×1.5", desc: "縛りを課して挑戦" },
];

// クエスト完了ボタン。showModeSelector=trueで挑戦モード(EXP倍率)を選べる。
export function CompleteQuestButton({
  questId,
  baseExp,
  showModeSelector = false,
}: {
  questId: string;
  baseExp?: number;
  showModeSelector?: boolean;
}) {
  const router = useRouter();
  const reportGrowthResult = useLevelUp();
  const [mode, setMode] = useState<QuestMode>("normal");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/quest/${questId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError("クエストの完了に失敗しました。");
        return;
      }
      reportGrowthResult(result);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {showModeSelector && (
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                mode === m.id ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
              }`}
            >
              {m.label} {m.mult}
              <span className="block text-[10px] opacity-70">
                {baseExp ? `+${Math.max(1, Math.round(baseExp * Number(m.mult.slice(1))))}EXP` : m.desc}
              </span>
            </button>
          ))}
        </div>
      )}
      <Button onClick={handleComplete} disabled={pending}>
        {pending ? "処理中..." : showModeSelector ? `${MODES.find((m) => m.id === mode)!.label}で完了にする` : "完了にする"}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
