import { prisma } from "@/lib/prisma";
import {
  getOctokitForUser,
  fetchCommits,
  fetchClosedIssues,
  fetchPullRequestsByUser,
} from "@/lib/github";
import { EXP_RATES, recalcLevel } from "@/lib/game/exp";
import { unlockBuildings } from "@/lib/game/buildings";
import { updateStreak, unlockAchievements } from "@/lib/game/achievements";

export type SyncResult = {
  newCommits: number;
  newIssues: number;
  newPullRequests: number;
  expGained: number;
  newLevel: number;
  unlockedBuildings: string[];
  unlockedAchievements: string[];
};

function isToday(date: Date): boolean {
  const now = new Date();
  return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}

/**
 * GitHub同期処理。フローの根拠: 18_Phase3_Detailed_Design.md Part5
 * 1. syncEnabledなリポジトリを取得
 * 2. 各リポジトリのcommit/issue/prを取得(初回は全期間、以降はlastSyncedAt以降)
 * 3-4. 新規分をinsertし、EXPを算出
 * 5. Playerの累計expに加算し、レベルを再計算
 * 6. 建物アンロック判定(M4)
 * 7. 実績・ストリーク判定(M5)
 * 8. lastSyncedAtを更新
 * 9. 結果を返す
 */
export async function syncGithubForUser(userId: string): Promise<SyncResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const octokit = await getOctokitForUser(userId);
  const githubLogin = user.githubLogin ?? "";

  const repositories = await prisma.githubRepository.findMany({
    where: { userId, syncEnabled: true },
  });
  // 全リポジトリが未同期(lastSyncedAtがnull)なら、これが最初の同期とみなす。
  const isFirstSync =
    repositories.length > 0 && repositories.every((r) => r.lastSyncedAt === null);

  let newCommits = 0;
  let newIssues = 0;
  let newPullRequests = 0;
  let expGained = 0;
  let hasActivityToday = false;

  for (const repository of repositories) {
    const [owner, repo] = repository.fullName.split("/");
    const since = repository.lastSyncedAt ?? undefined;

    // --- Commit ---
    const commits = await fetchCommits(octokit, owner, repo, githubLogin, since);
    if (commits.some((c) => isToday(c.committedAt))) {
      hasActivityToday = true;
    }
    if (commits.length > 0) {
      const result = await prisma.githubCommit.createMany({
        data: commits.map((c) => ({
          repositoryId: repository.id,
          sha: c.sha,
          message: c.message,
          committedAt: c.committedAt,
          expAwarded: EXP_RATES.commit,
        })),
        skipDuplicates: true,
      });
      newCommits += result.count;
      expGained += result.count * EXP_RATES.commit;
    }

    // --- Issue (close) ---
    const issues = await fetchClosedIssues(octokit, owner, repo, githubLogin, since);
    if (issues.some((i) => i.closedAt && isToday(i.closedAt))) {
      hasActivityToday = true;
    }
    if (issues.length > 0) {
      const result = await prisma.githubIssue.createMany({
        data: issues.map((i) => ({
          repositoryId: repository.id,
          issueNumber: i.issueNumber,
          state: i.state,
          closedAt: i.closedAt,
          expAwarded: EXP_RATES.issueClose,
        })),
        skipDuplicates: true,
      });
      newIssues += result.count;
      expGained += result.count * EXP_RATES.issueClose;
    }

    // --- Pull Request ---
    // PRは「作成」と「後日マージ」で別々にEXPを付与するため、
    // createMany一括ではなく既存レコードの有無で処理を分ける。
    const pullRequests = await fetchPullRequestsByUser(
      octokit,
      owner,
      repo,
      githubLogin,
      since
    );
    if (pullRequests.some((pr) => isToday(pr.createdAt))) {
      hasActivityToday = true;
    }
    for (const pr of pullRequests) {
      const existing = await prisma.githubPullRequest.findUnique({
        where: {
          repositoryId_prNumber: {
            repositoryId: repository.id,
            prNumber: pr.prNumber,
          },
        },
      });

      if (!existing) {
        const expAwarded =
          EXP_RATES.prOpen + (pr.mergedAt ? EXP_RATES.prMerge : 0);
        await prisma.githubPullRequest.create({
          data: {
            repositoryId: repository.id,
            prNumber: pr.prNumber,
            state: pr.state,
            mergedAt: pr.mergedAt,
            expAwarded,
          },
        });
        newPullRequests += 1;
        expGained += expAwarded;
      } else if (!existing.mergedAt && pr.mergedAt) {
        await prisma.githubPullRequest.update({
          where: { id: existing.id },
          data: {
            state: pr.state,
            mergedAt: pr.mergedAt,
            expAwarded: existing.expAwarded + EXP_RATES.prMerge,
          },
        });
        expGained += EXP_RATES.prMerge;
      }
    }

    await prisma.githubRepository.update({
      where: { id: repository.id },
      data: { lastSyncedAt: new Date() },
    });
  }

  const updatedPlayer = await prisma.player.update({
    where: { userId },
    data: { exp: { increment: expGained } },
    include: { village: true },
  });

  const { level } = recalcLevel(updatedPlayer.exp);
  if (level !== updatedPlayer.level) {
    await prisma.player.update({ where: { userId }, data: { level } });
  }

  const unlockedBuildings = updatedPlayer.village
    ? await unlockBuildings(userId, updatedPlayer.village.id, level)
    : [];

  await updateStreak(userId, hasActivityToday);
  const unlockedAchievements = await unlockAchievements(userId, isFirstSync);

  return {
    newCommits,
    newIssues,
    newPullRequests,
    expGained,
    newLevel: level,
    unlockedBuildings,
    unlockedAchievements,
  };
}
