import { prisma } from "@/lib/prisma";

export type QuestDifficulty = "easy" | "medium" | "hard";

export type GeneratedQuestSuggestion = {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
};

/**
 * GitHub活動・資格の学習状況をもとに、ルールベースで今日のクエストを1つ選ぶ。
 * Claude API(有料・任意設定)が使えない場合のフォールバックとして
 * lib/ai/questPrompt.tsから呼び出される、無料で完結するクエスト生成ロジック。
 *
 * 優先度: 資格未設定 > 学習中の資格がある > コミットが少ない >
 *        Issue対応が少ない > PR作成が少ない > 継続中のタスク消化 > 汎用
 */
export async function generateDailyQuest(
  userId: string
): Promise<GeneratedQuestSuggestion> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [commitCount, issueCloseCount, prOpenCount, qualifications] =
    await Promise.all([
      prisma.githubCommit.count({
        where: { repository: { userId }, committedAt: { gte: sevenDaysAgo } },
      }),
      prisma.githubIssue.count({
        where: { repository: { userId }, closedAt: { gte: sevenDaysAgo } },
      }),
      prisma.githubPullRequest.count({
        where: { repository: { userId }, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.playerQualification.findMany({ where: { playerId: player.id } }),
    ]);

  if (qualifications.length === 0) {
    return {
      title: "目標資格を1つ設定しよう",
      description:
        "プレイヤー画面から、これから挑戦したい資格を1つ選んでみましょう。",
      difficulty: "easy",
    };
  }

  const hasActiveLearning = qualifications.some(
    (q) => q.status === "learning" || q.status === "planning"
  );
  if (hasActiveLearning) {
    return {
      title: "15分だけ資格学習をしよう",
      description:
        "学習中・受験予定の資格について、今日は15分だけ学習時間を確保しましょう。",
      difficulty: "easy",
    };
  }

  if (commitCount === 0) {
    return {
      title: "小さなリファクタリングをしよう",
      description:
        "気になっていたコードを1箇所、小さくリファクタリングしてコミットしてみましょう。",
      difficulty: "easy",
    };
  }

  if (issueCloseCount === 0) {
    return {
      title: "Issueを1件クローズしよう",
      description: "対応中のIssueを1件選んで、クローズを目指しましょう。",
      difficulty: "medium",
    };
  }

  if (prOpenCount === 0) {
    return {
      title: "PRを1件作成しよう",
      description: "進めている変更をPull Requestとして1件作成してみましょう。",
      difficulty: "medium",
    };
  }

  if (player.currentStreak > 0) {
    return {
      title: "今日も1つタスクを完了しよう",
      description: `${player.currentStreak}日連続の活動を継続中です。今日も何か1つ完了させましょう。`,
      difficulty: "easy",
    };
  }

  return {
    title: "小さな一歩を踏み出そう",
    description: "今日は何か1つ、小さな改善に取り組んでみましょう。",
    difficulty: "easy",
  };
}
