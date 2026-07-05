import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function TermsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="text-primary size-6" />
          利用規約
        </h1>
      </div>

      <Card>
        <CardContent className="text-muted-foreground flex flex-col gap-4 py-4 text-sm leading-relaxed">
          <p>
            本サービスは開発中(MVP)のため、予告なく機能の変更・データのリセットが行われる場合があります。
          </p>
          <p>
            利用者は、自己の責任において本サービスを利用するものとし、サービスの利用によって生じたいかなる損害についても運営者は責任を負いません。
          </p>
          <p>本ページはMVP段階の簡易版です。正式な利用規約は今後整備予定です。</p>
        </CardContent>
      </Card>
    </main>
  );
}
