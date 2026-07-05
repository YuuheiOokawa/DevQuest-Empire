"use client";

import { useState } from "react";
import {
  Bot,
  MessageCircle,
  GitBranch,
  BookOpen,
  GraduationCap,
  Castle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiConsultModal } from "@/components/ai/AiConsultModal";

export function AiAssistantPanel({
  playerName,
  githubComment,
  learningSuggestion,
  certificationSuggestion,
  worldAdvice,
  levelUpSuggestion,
}: {
  playerName: string;
  githubComment: string;
  learningSuggestion: string;
  certificationSuggestion: string;
  worldAdvice: string;
  levelUpSuggestion: string;
}) {
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    <>
      <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 shadow-sm dark:border-violet-900 dark:from-violet-950/30 dark:via-neutral-900 dark:to-emerald-950/20">
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-md shadow-violet-500/30">
              <Bot className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">AI秘書</p>
              <p className="text-muted-foreground truncate text-xs">
                {playerName}さんへの今日のブリーフィング
              </p>
            </div>
          </div>

          <div className="space-y-2.5 rounded-2xl bg-white/70 p-3.5 text-sm dark:bg-black/20">
            <div className="flex items-start gap-2">
              <GitBranch className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{githubComment}</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <span>{learningSuggestion}</span>
            </div>
            <div className="flex items-start gap-2">
              <GraduationCap className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{certificationSuggestion}</span>
            </div>
            <div className="flex items-start gap-2">
              <Castle className="mt-0.5 size-4 shrink-0 text-violet-600 dark:text-violet-400" />
              <span>{worldAdvice}</span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{levelUpSuggestion}</span>
            </div>
          </div>

          <Button
            onClick={() => setConsultOpen(true)}
            className="w-full gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600"
          >
            <MessageCircle className="size-4" />
            AIに相談する
          </Button>
        </CardContent>
      </Card>
      {consultOpen && <AiConsultModal onClose={() => setConsultOpen(false)} />}
    </>
  );
}
