"use client";

import { createPortal } from "react-dom";
import { Sparkles, Crown, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LevelUpEvent = {
  fromLevel: number;
  toLevel: number;
  unlockedTitles: string[];
  tierUpTo: string | null;
};

export function LevelUpModal({
  event,
  onClose,
}: {
  event: LevelUpEvent;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-emerald-50 p-6 text-center shadow-2xl dark:border-amber-900 dark:from-neutral-900 dark:to-emerald-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
        >
          <X className="size-5" />
        </button>

        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-lg shadow-amber-500/40">
          <Sparkles className="size-8" />
        </div>

        <p className="text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
          LEVEL UP!
        </p>

        <div className="my-3 flex items-center justify-center gap-3 text-3xl font-bold">
          <span className="text-muted-foreground">Lv.{event.fromLevel}</span>
          <span className="text-emerald-500">→</span>
          <span className="bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
            Lv.{event.toLevel}
          </span>
        </div>

        {event.tierUpTo && (
          <p className="mb-2 flex items-center justify-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
            <Crown className="size-4" />
            村が「{event.tierUpTo}」に発展しました!
          </p>
        )}

        {event.unlockedTitles.length > 0 && (
          <div className="mb-3 space-y-1">
            {event.unlockedTitles.map((title) => (
              <p
                key={title}
                className="flex items-center justify-center gap-1 text-sm text-amber-600 dark:text-amber-400"
              >
                <Award className="size-4" />
                称号「{title}」を獲得しました
              </p>
            ))}
          </div>
        )}

        <Button onClick={onClose} className="mt-2 w-full">
          閉じる
        </Button>
      </div>
    </div>,
    document.body
  );
}
