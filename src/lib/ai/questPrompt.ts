import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/ai/claude";

// 根拠: 18_Phase3_Detailed_Design.md Part4-1

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_EXP: Record<Difficulty, number> = {
  easy: 20,
  medium: 35,
  hard: 50,
};

const FALLBACK_QUESTS: { title: string; description: string; difficulty: Difficulty }[] = [
  { title: "READMEを見直す", description: "自分のリポジトリのREADMEを読み返し、誤字や古い情報を1つ直してみましょう。", difficulty: "easy" },
  { title: "小さなリファクタリング", description: "気になっていた関数や変数名を1つ、わかりやすい名前に変更してみましょう。", difficulty: "easy" },
  { title: "テストを1つ追加する", description: "既存の関数に対して、まだ無いテストケースを1つ書いてみましょう。", difficulty: "medium" },
  { title: "Issueを1件起票する", description: "気になっているバグや改善点をIssueとして書き出してみましょう。", difficulty: "easy" },
  { title: "ドキュメントを書く", description: "実装した機能について、簡単な説明をコメントかドキュメントに残しましょう。", difficulty: "easy" },
  { title: "依存パッケージを確認する", description: "package.jsonの依存関係に古いものがないか確認してみましょう。", difficulty: "medium" },
  { title: "小さなバグを1つ直す", description: "放置していた小さな不具合を1つ選んで修正してみましょう。", difficulty: "medium" },
  { title: "直近のコミットを見返す", description: "自分の直近のコミットを見直し、改善できる点を探してみましょう。", difficulty: "easy" },
  { title: "新しいライブラリを調べる", description: "興味のあるライブラリのドキュメントを15分読んでみましょう。", difficulty: "easy" },
  { title: "エラーハンドリングを見直す", description: "1つの関数のエラーハンドリングを見直し、改善してみましょう。", difficulty: "hard" },
];

function pickFallbackQuest() {
  return FALLBACK_QUESTS[Math.floor(Math.random() * FALLBACK_QUESTS.length)];
}

export type GeneratedQuest = {
  title: string;
  description: string;
  difficulty: Difficulty;
  expReward: number;
};

export async function generateTodaysQuest(userId: string): Promise<GeneratedQuest> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const [commitCount, issueCloseCount, prOpenCount, prMergeCount, recentCommits, recentQuests] =
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
      prisma.githubPullRequest.count({
        where: { repository: { userId }, mergedAt: { gte: sevenDaysAgo } },
      }),
      prisma.githubCommit.findMany({
        where: { repository: { userId } },
        orderBy: { committedAt: "desc" },
        take: 3,
        select: { message: true },
      }),
      prisma.quest.findMany({
        where: {
          playerId: player.id,
          status: "completed",
          completedAt: { gte: threeDaysAgo },
        },
        select: { title: true },
      }),
    ]);

  const prompt = `直近7日間のGitHub活動:
- コミット数: ${commitCount}
- Issue Close数: ${issueCloseCount}
- Pull Request作成数: ${prOpenCount}
- Pull Request Merge数: ${prMergeCount}

直近のコミットメッセージ:
${recentCommits.map((c) => `- ${c.message}`).join("\n") || "(まだコミットがありません)"}

プレイヤーレベル: ${player.level}

直近3日で完了したクエスト:
${recentQuests.map((q) => `- ${q.title}`).join("\n") || "(なし)"}

上記の傾向を踏まえ、今日取り組むと良い小さな開発タスクを1つ提案してください。
直近3日のクエストと同じ内容は避けてください。`;

  try {
    const result = await generateStructured<{
      title: string;
      description: string;
      difficulty: Difficulty;
    }>({
      system:
        "あなたは開発者の学習・開発活動を応援するゲームマスターです。日本語で簡潔に回答してください。",
      prompt,
      toolName: "propose_quest",
      toolDescription: "今日取り組むべき開発クエストを1つ提案する",
      inputSchema: {
        properties: {
          title: { type: "string", description: "クエストのタイトル(40文字以内)" },
          description: { type: "string", description: "クエストの説明(120文字以内)" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        },
        required: ["title", "description", "difficulty"],
      },
      maxTokens: 200,
    });

    return {
      title: result.title.slice(0, 40),
      description: result.description.slice(0, 120),
      difficulty: result.difficulty,
      expReward: DIFFICULTY_EXP[result.difficulty] ?? DIFFICULTY_EXP.easy,
    };
  } catch (err) {
    console.error("AI quest generation failed, using fallback quest", err);
    const fallback = pickFallbackQuest();
    return { ...fallback, expReward: DIFFICULTY_EXP[fallback.difficulty] };
  }
}
