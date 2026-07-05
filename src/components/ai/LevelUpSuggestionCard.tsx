import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LevelUpSuggestionCard({ suggestion }: { suggestion: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <TrendingUp className="text-primary size-4" />
          レベルアップ提案
        </h3>
        <p className="text-muted-foreground text-sm">{suggestion}</p>
      </CardContent>
    </Card>
  );
}
