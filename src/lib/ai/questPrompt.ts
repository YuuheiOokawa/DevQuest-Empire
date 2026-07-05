import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/ai/claude";
import { generateDailyQuest } from "@/services/questService";

// 根拠: 18_Phase3_Detailed_Design.md Part4-1

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_EXP: Record<Difficulty, number> = {
  easy: 20,
  medium: 35,
  hard: 50,
};

// フォールバック文言はFallbackQuestテーブルで管理する(prisma/seed.ts参照)。
// DB未投入等の想定外の事態に備え、最終手段として1件だけコード内に保持する。
const ULTIMATE_FALLBACK_QUEST = {
  title: "小さな一歩を踏み出す",
  description: "今日は何か1つ、小さな改善に取り組んでみましょう。",
  difficulty: "easy" as Difficulty,
};

async function pickFallbackQuest(): Promise<{
  title: string;
  description: string;
  difficulty: Difficulty;
}> {
  const quests = await prisma.fallbackQuest.findMany();
  if (quests.length === 0) return ULTIMATE_FALLBACK_QUEST;
  const picked = quests[Math.floor(Math.random() * quests.length)];
  return {
    title: picked.title,
    description: picked.description,
    difficulty: picked.difficulty as Difficulty,
  };
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
    console.error("AI quest generation failed, using rule-based fallback quest", err);
    try {
      const fallback = await generateDailyQuest(userId);
      return { ...fallback, expReward: DIFFICULTY_EXP[fallback.difficulty] };
    } catch (fallbackErr) {
      console.error("Rule-based fallback quest failed, using random fallback", fallbackErr);
      const fallback = await pickFallbackQuest();
      return { ...fallback, expReward: DIFFICULTY_EXP[fallback.difficulty] };
    }
  }
}
