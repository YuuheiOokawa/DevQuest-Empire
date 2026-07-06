import { Bot } from "lucide-react";
import { AiStudioClient } from "@/components/ai-studio/AiStudioClient";

// AI開発スタジオ画面。認証は(app)レイアウトが担う。
// ゲームではなく「AI社員が実際のGitHub開発フローを進める組織」のMVP。
// GitHub操作(Repo作成/Push/Merge/Deploy)は必ずHuman Approvalを挟む。
export default function AiStudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="text-primary size-6" />
          AI開発スタジオ
        </h1>
        <p className="text-muted-foreground text-sm">
          AI社員が市場調査・企画・設計・実装・レビューを進め、GitHubへのRepository作成・Push・Merge・Deployは
          すべてCEO(あなた)の承認後にのみ実行されます。
        </p>
      </div>
      <AiStudioClient />
    </main>
  );
}
