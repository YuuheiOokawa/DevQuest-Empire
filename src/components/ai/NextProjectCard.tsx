"use client";

import { useState } from "react";
import { Building2, Lightbulb, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectSuggestion } from "@/lib/ai/projectIdeas";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "易",
  normal: "普通",
  hard: "難",
  expert: "最難関",
};

export function NextProjectCard({
  suggestions,
}: {
  suggestions: ProjectSuggestion[];
}) {
  const [index, setIndex] = useState(0);

  if (suggestions.length === 0) {
    return null;
  }

  const current = suggestions[index % suggestions.length];

  return (
    <Card className="border-emerald-200 dark:border-emerald-900">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Building2 className="text-primary size-4" />
            経営会議:次の開発プロジェクト
          </h3>
          <Badge variant="outline">{DIFFICULTY_LABEL[current.idea.difficulty]}</Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          AI社員たちが会議を開き、あなたが次に着手すると良さそうなプロジェクトを提案します。
        </p>
        <div className="bg-muted/50 flex items-start gap-2 rounded-xl p-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="font-medium">{current.idea.title}</p>
            <p className="text-muted-foreground text-sm">{current.idea.description}</p>
            <p className="text-muted-foreground text-xs">{current.reason}</p>
          </div>
        </div>
        {suggestions.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 self-start"
            onClick={() => setIndex((prev) => prev + 1)}
          >
            <RefreshCw className="size-3.5" />
            他の提案を見る
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
