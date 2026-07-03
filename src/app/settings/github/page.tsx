import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRepositoriesForUser } from "@/lib/github";
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
  } catch {
    error = "GitHubリポジトリの取得に失敗しました。時間をおいて再度お試しください。";
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">GitHub連携設定</h1>
        <p className="text-muted-foreground text-sm">
          同期対象にするリポジトリを選択してください。
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm">{error}</p>
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
