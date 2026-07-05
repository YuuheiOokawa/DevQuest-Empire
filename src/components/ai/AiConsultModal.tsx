"use client";

import { createPortal } from "react-dom";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// MVP: 実際のチャット応答は未実装。将来Claude APIによる対話機能に置き換える想定。
export function AiConsultModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
              <Bot className="size-4" />
            </div>
            <span className="font-semibold">AI秘書</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          AIとの対話機能は現在開発中です。今後、あなたの活動状況を踏まえて相談できるチャット機能を追加予定です。もうしばらくお待ちください。
        </p>
        <Button onClick={onClose} className="mt-4 w-full">
          閉じる
        </Button>
      </div>
    </div>,
    document.body
  );
}
