import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CertificationSuggestion } from "@/lib/ai/suggestions";

export function CertificationSuggestionCard({
  suggestion,
}: {
  suggestion: CertificationSuggestion;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <GraduationCap className="text-primary size-4" />
          資格提案
        </h3>
        <p className="font-medium">{suggestion.title}</p>
        <p className="text-muted-foreground text-sm">{suggestion.description}</p>
      </CardContent>
    </Card>
  );
}
