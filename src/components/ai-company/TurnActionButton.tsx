"use client";

import { Play, Pause, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";

// 画面下部に固定表示する「1ターン進める」ボタン(+自動進行トグル)。
// フッターナビの上に重ならないようbottom位置を調整している。
export function TurnActionButton({
  onAdvance,
  autoRunning,
  onToggleAuto,
  disabled,
}: {
  onAdvance: () => void;
  autoRunning: boolean;
  onToggleAuto: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-30 flex justify-center px-4">
      <div className="bg-card/95 flex w-full max-w-md items-center gap-2 rounded-2xl border p-2 shadow-lg backdrop-blur">
        <Button
          onClick={onAdvance}
          disabled={disabled || autoRunning}
          className="h-11 flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-600"
        >
          <FastForward className="size-5" />
          1ターン進める
        </Button>
        <Button
          variant={autoRunning ? "default" : "outline"}
          onClick={onToggleAuto}
          disabled={disabled}
          className={`h-11 gap-1.5 ${autoRunning ? "bg-amber-500 text-white hover:bg-amber-600" : ""}`}
        >
          {autoRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
          {autoRunning ? "停止" : "自動"}
        </Button>
      </div>
    </div>
  );
}
