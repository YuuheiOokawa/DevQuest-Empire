import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function PrivacyPolicyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="text-primary size-6" />
          プライバシーポリシー
        </h1>
      </div>

      <Card>
        <CardContent className="text-muted-foreground flex flex-col gap-4 py-4 text-sm leading-relaxed">
          <p>
            DevQuest Empireは、GitHubアカウントの公開情報および利用者が同意した範囲のリポジトリ活動情報(コミット・Issue・Pull
            Request)を、ゲーム内の成長要素の計算にのみ利用します。
          </p>
          <p>
            学習記録・資格情報など利用者が入力したデータは、本アプリのサービス提供以外の目的では利用しません。
          </p>
          <p>
            本ページはMVP段階の簡易版です。正式なプライバシーポリシーは今後整備予定です。
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
