import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// MVP: チャット機能は未実装。将来Claude APIを使ったAI秘書チャットに置き換える想定。
export function AiAssistantCard() {
  return (
    <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-transparent dark:border-emerald-800 dark:from-emerald-950/30">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Bot className="text-primary size-4" />
            AI秘書
          </h3>
          <Badge variant="secondary">準備中</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          あなたの活動状況を把握したAI秘書に、いつでも相談できるようになります。
        </p>
        <Input
          disabled
          placeholder="例: 今週何をすればいい?(近日公開)"
          className="bg-background"
        />
      </CardContent>
    </Card>
  );
}
