import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/ai/claude";

// 根拠: 18_Phase3_Detailed_Design.md Part4-2

const FALLBACK_COMMENT = "今週も活動お疲れさまです。";

export async function generateActivityComment(userId: string): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeekCommits, lastWeekCommits, thisWeekIssues, thisWeekPrs] =
    await Promise.all([
      prisma.githubCommit.count({
        where: { repository: { userId }, committedAt: { gte: sevenDaysAgo } },
      }),
      prisma.githubCommit.count({
        where: {
          repository: { userId },
          committedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      prisma.githubIssue.count({
        where: { repository: { userId }, closedAt: { gte: sevenDaysAgo } },
      }),
      prisma.githubPullRequest.count({
        where: { repository: { userId }, mergedAt: { gte: sevenDaysAgo } },
      }),
    ]);

  const prompt = `直近7日間のGitHub活動: コミット${thisWeekCommits}件(前週${lastWeekCommits}件)、Issue Close ${thisWeekIssues}件、Pull Request Merge ${thisWeekPrs}件。
この活動を踏まえて、開発者への一言コメントを日本語80文字以内で生成してください。労いや気づきを含め、前向きな内容にしてください。`;

  try {
    const result = await generateStructured<{ comment: string }>({
      system:
        "あなたは開発者を応援するアシスタントです。日本語で短く前向きなコメントを書いてください。",
      prompt,
      toolName: "propose_comment",
      toolDescription: "GitHub活動への一言コメントを生成する",
      inputSchema: {
        properties: {
          comment: { type: "string", description: "80文字以内の一言コメント" },
        },
        required: ["comment"],
      },
      maxTokens: 150,
    });
    return result.comment.slice(0, 80);
  } catch (err) {
    console.error("AI activity comment generation failed, using fallback", err);
    return FALLBACK_COMMENT;
  }
}
