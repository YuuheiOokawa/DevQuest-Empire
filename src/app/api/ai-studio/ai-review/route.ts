import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateStructured } from "@/lib/ai/claude";

// 実AIレビュー: ANTHROPIC_API_KEYが設定されていればClaude APIで
// 5観点レビューを実行する。未設定/失敗時は fallback:true を返し、
// クライアント側はルールベースのレビューを維持する(課金なしでも動作)。

type ReviewInput = {
  appName: string;
  techStack: string[];
  files: { path: string; summary: string }[];
};

type AiReviewResult = {
  reviews: { aspect: string; score: number; findings: string[] }[];
};

const ASPECTS = ["コード品質", "セキュリティ", "パフォーマンス", "アクセシビリティ", "アーキテクチャ"] as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: ReviewInput;
  try {
    body = (await request.json()) as ReviewInput;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.appName || !Array.isArray(body.files)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const prompt = `アプリ「${String(body.appName).slice(0, 60)}」(スタック: ${(body.techStack ?? []).slice(0, 8).join("/")})の変更計画をレビューしてください。
変更ファイル:
${body.files.slice(0, 30).map((f) => `- ${String(f.path).slice(0, 100)}: ${String(f.summary).slice(0, 80)}`).join("\n")}

5観点(${ASPECTS.join("/")})それぞれについて、score(0-100)と日本語の指摘findings(各観点2件まで、具体的な改善アクション)を返してください。`;

  try {
    const result = await generateStructured<AiReviewResult>({
      system: "あなたは経験豊富なソフトウェアレビューパネルです。厳密かつ建設的にレビューしてください。",
      prompt,
      toolName: "submit_review",
      toolDescription: "5観点のレビュー結果を提出する",
      inputSchema: {
        properties: {
          reviews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                aspect: { type: "string", enum: [...ASPECTS] },
                score: { type: "number" },
                findings: { type: "array", items: { type: "string" } },
              },
              required: ["aspect", "score", "findings"],
            },
          },
        },
        required: ["reviews"],
      },
      maxTokens: 1200,
      timeoutMs: 20000,
    });
    // スコアを0-100へクランプ(ハルシネーション対策)
    const reviews = (result.reviews ?? [])
      .filter((r) => (ASPECTS as readonly string[]).includes(r.aspect))
      .map((r) => ({
        aspect: r.aspect,
        score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
        findings: (r.findings ?? []).slice(0, 3).map((f) => String(f).slice(0, 200)),
      }));
    if (reviews.length === 0) throw new Error("empty review");
    return NextResponse.json({ ok: true, reviews });
  } catch {
    // APIキー未設定・タイムアウト等: ルールベースへフォールバック
    return NextResponse.json({ ok: false, fallback: true });
  }
}
