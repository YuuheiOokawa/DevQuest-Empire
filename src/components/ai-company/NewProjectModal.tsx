"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIdeaCard } from "@/components/ai-company/AppIdeaCard";
import { generateIdeaCandidates } from "@/services/appIdeaGenerator";
import type { AppIdea } from "@/services/aiCompanyTypes";

// 新規プロジェクト開始モーダル。AI社員が考えた企画候補3つから
// 社長(ユーザー)が1つを承認する、という体裁にしている。
export function NewProjectModal({
  onStart,
  onClose,
}: {
  onStart: (idea: AppIdea) => void;
  onClose: () => void;
}) {
  const [candidates, setCandidates] = useState<AppIdea[]>(() => generateIdeaCandidates(3));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-card flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3">
          <h3 className="flex items-center gap-1.5 font-bold">
            <Sparkles className="size-4 text-amber-500" />
            AI社員からの企画提案
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-muted-foreground pb-3 text-xs">
          AI社員が3つの企画を提案しました。開発するアプリを1つ選んで承認してください(立ち上げ費用 10,000円)。
        </p>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {candidates.map((idea) => (
            <AppIdeaCard
              key={idea.id}
              idea={idea}
              selected={idea.id === selectedId}
              onSelect={() => setSelectedId(idea.id)}
            />
          ))}
        </div>
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setCandidates(generateIdeaCandidates(3));
              setSelectedId(null);
            }}
          >
            <RefreshCw className="size-3.5" />
            再提案
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={!selected}
            onClick={() => selected && onStart(selected)}
          >
            この企画で開発開始
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
