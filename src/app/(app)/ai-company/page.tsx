import { Building2 } from "lucide-react";
import { AiCompanyClient } from "@/components/ai-company/AiCompanyClient";

// AI会社経営画面。認証は(app)レイアウトが担う。
// シミュレーションは完全にクライアント側(ルールベース+localStorage)で動く。
export default function AiCompanyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Building2 className="text-primary size-6" />
          AI Software Company
        </h1>
        <p className="text-muted-foreground text-sm">
          あなたは社長。AI社員たちが企画・設計・実装・レビュー・リリースまで自動で進めます。
          あなたの仕事は採用・育成・投資・承認です。
        </p>
      </div>
      <AiCompanyClient />
    </main>
  );
}
