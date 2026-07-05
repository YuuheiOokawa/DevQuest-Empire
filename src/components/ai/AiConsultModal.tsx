"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  X,
  ChevronLeft,
  GitBranch,
  BookOpen,
  GraduationCap,
  Castle,
  TrendingUp,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ConsultTopic = {
  id: string;
  label: string;
  icon: LucideIcon;
  answer: string;
};

export function buildConsultTopics(data: {
  githubComment: string;
  learningSuggestion: string;
  certificationSuggestion: string;
  worldAdvice: string;
  levelUpSuggestion: string;
  nextProjectSuggestion: string;
}): ConsultTopic[] {
  return [
    { id: "github", label: "GitHub活動について", icon: GitBranch, answer: data.githubComment },
    { id: "learning", label: "学習について", icon: BookOpen, answer: data.learningSuggestion },
    {
      id: "certification",
      label: "資格について",
      icon: GraduationCap,
      answer: data.certificationSuggestion,
    },
    { id: "world", label: "村の発展について", icon: Castle, answer: data.worldAdvice },
    { id: "levelup", label: "レベルアップについて", icon: TrendingUp, answer: data.levelUpSuggestion },
    {
      id: "project",
      label: "次に作るアプリについて",
      icon: Building2,
      answer: data.nextProjectSuggestion,
    },
  ];
}

// MVP: ルールベースの固定回答による疑似対話。実際の自然文チャットではなく、
// 話題を選ぶとAI画面で既に算出済みの提案をそのまま表示する仕組みで、
// 新たな有料API呼び出しは発生しない。
export function AiConsultModal({
  topics,
  onClose,
}: {
  topics: ConsultTopic[];
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = topics.find((t) => t.id === selectedId) ?? null;

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
            {selected ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="話題選択に戻る"
                className="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center rounded-full"
              >
                <ChevronLeft className="size-4" />
              </button>
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
                <Bot className="size-4" />
              </div>
            )}
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

        {selected ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs">{selected.label}</p>
            <p className="text-sm leading-relaxed">{selected.answer}</p>
            <Button onClick={() => setSelectedId(null)} variant="outline" className="w-full">
              他の話題を聞く
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              何について相談しますか?気になる話題を選んでください。
            </p>
            <div className="flex flex-col gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedId(topic.id)}
                  className="hover:bg-accent flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors"
                >
                  <topic.icon className="text-primary size-4 shrink-0" />
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
