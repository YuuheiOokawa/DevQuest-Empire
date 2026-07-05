import { redirect } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

const FAQS = [
  {
    question: "EXPはどうやって獲得しますか?",
    answer:
      "GitHubのコミット・Issueクローズ・PRマージを同期する、クエストやミッションを達成する、学習記録や資格合格を登録するなど、様々な活動でEXPを獲得できます。",
  },
  {
    question: "村(ワールド)はどうやって発展しますか?",
    answer:
      "GitHub活動・学習・資格・ミッションの積み重ねで建物が成長し、一定の条件を満たすと村→町→都市→王国→帝国→天空帝国へと発展していきます。",
  },
  {
    question: "実績・称号はどう解放されますか?",
    answer:
      "レベル・連続活動日数・累計コミット数など、様々な指標がしきい値を超えると自動的に解放されます。プレイヤー画面から確認できます。",
  },
];

export default async function HelpPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <HelpCircle className="text-primary size-6" />
          ヘルプ
        </h1>
        <p className="text-muted-foreground text-sm">
          よくある質問をまとめています。
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq) => (
          <Card key={faq.question}>
            <CardContent className="flex flex-col gap-1 py-4">
              <p className="font-medium">{faq.question}</p>
              <p className="text-muted-foreground text-sm">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
