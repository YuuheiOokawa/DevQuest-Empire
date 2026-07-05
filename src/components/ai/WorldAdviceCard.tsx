import { Castle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WorldAdviceCard({ advice }: { advice: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <Castle className="text-primary size-4" />
          村の発展提案
        </h3>
        <p className="text-muted-foreground text-sm">{advice}</p>
      </CardContent>
    </Card>
  );
}
