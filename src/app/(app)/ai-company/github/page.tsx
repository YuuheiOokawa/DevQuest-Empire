import Link from "next/link";
import { FolderGit2, ArrowLeft } from "lucide-react";
import { GithubClient } from "@/components/ai-company/GithubClient";

// AI社員の開発活動をGitHub風UIで見る画面(読み取り専用)。
export default function AiCompanyGithubPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-10">
      <div className="space-y-1">
        <Link
          href="/ai-company"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="size-3" />
          AI会社経営へ戻る
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FolderGit2 className="text-primary size-6" />
          社内GitHub
        </h1>
        <p className="text-muted-foreground text-sm">
          AI社員たちの開発活動(Commit / PR / Issue / Review / Branch / Release)。
        </p>
      </div>
      <GithubClient />
    </main>
  );
}
