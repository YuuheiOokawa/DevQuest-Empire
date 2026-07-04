import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// MVP: AI社員の経営シミュレーションは未実装。
// ワールド画面のNPC(aiWorker、村がTier5以上で出現)と連動させる構想。
export function AiEmployeeCard() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Users className="text-primary size-4" />
            AI社員
          </h3>
          <Badge variant="secondary">構想中</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          村が「王国」以上に発展すると、ワールドにAI社員が登場します。将来的にはAI社員があなたの代わりに
          コードレビューや学習提案を行う経営シミュレーションへ拡張予定です。
        </p>
      </CardContent>
    </Card>
  );
}
