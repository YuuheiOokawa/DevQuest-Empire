import { redirect } from "next/navigation";
import { GitBranch } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRepositoriesForUser, describeGithubError } from "@/lib/github";
import { RepositoryList } from "@/components/github/RepositoryList";
import { AppNav } from "@/components/layout/AppNav";

export default async function GithubSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let repositories: Awaited<ReturnType<typeof getRepositoriesForUser>> = [];
  let error: string | null = null;
  try {
    repositories = await getRepositoriesForUser(session.user.id);
  } catch (err) {
    error = describeGithubError(err);
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <GitBranch className="text-primary size-6" />
          GitHub連携設定
        </h1>
        <p className="text-muted-foreground text-sm">
          同期対象にするリポジトリを選択してください。
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-destructive text-sm">{error}</p>
          <a
            href="/settings/github"
            className="text-sm underline hover:no-underline"
          >
            再読み込み
          </a>
        </div>
      ) : (
        <RepositoryList
          initialRepositories={repositories.map((r) => ({
            ...r,
            lastSyncedAt: r.lastSyncedAt ? r.lastSyncedAt.toISOString() : null,
          }))}
        />
      )}
      </main>
    </>
  );
}
