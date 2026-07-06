import { FolderGit2 } from "lucide-react";
import { GithubConsoleClient } from "@/components/ai-studio/GithubConsoleClient";

// 実GitHub連携コンソール。読み取りはいつでも、書き込みはHuman Approval後のみ。
export default function AiStudioGithubPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FolderGit2 className="text-primary size-6" />
          GitHubコンソール
        </h1>
        <p className="text-muted-foreground text-sm">
          あなたのGitHubアカウントの状態を表示します。Repository作成・Push・Merge・Release・Deployは
          Approval Queueでの承認後にのみ実行されます。
        </p>
      </div>
      <GithubConsoleClient />
    </main>
  );
}
