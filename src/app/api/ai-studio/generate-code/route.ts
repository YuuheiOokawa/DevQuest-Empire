import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateStructured } from "@/lib/ai/claude";

// 実コード生成: ANTHROPIC_API_KEYが設定されていれば、Push対象ファイルの
// 「動く実装コード」をClaude APIで生成する。未設定/失敗時は fallback:true を
// 返し、クライアントはスキャフォールド(実装指示コメント入り雛形)を維持する。
// このルートはコードを「生成して返すだけ」で、GitHubへの書き込みは行わない。
// Pushは従来どおりHuman Approval済みのexecuteエンドポイントのみが行う。

type GenerateInput = {
  appName: string;
  techStack: string[];
  features: string[];
  mvpScope: string[];
  files: { path: string; summary: string }[];
};

type GenerateResult = {
  files: { path: string; content: string }[];
};

const MAX_FILES = 20;
const MAX_CONTENT = 30_000;

function isSafePath(path: string): boolean {
  return path.length > 0 && path.length < 200 && !path.startsWith("/") && !path.includes("..") && !path.includes("\\");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: GenerateInput;
  try {
    body = (await request.json()) as GenerateInput;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.appName || !Array.isArray(body.files) || body.files.length === 0) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const requested = body.files
    .slice(0, MAX_FILES)
    .filter((f) => isSafePath(String(f.path)))
    .map((f) => ({ path: String(f.path), summary: String(f.summary).slice(0, 120) }));

  const prompt = `アプリ「${String(body.appName).slice(0, 60)}」のMVPを実装してください。
- 技術スタック: ${(body.techStack ?? []).slice(0, 8).join(" / ")}
- 主要機能: ${(body.features ?? []).slice(0, 6).join("、")}
- MVPスコープ: ${(body.mvpScope ?? []).slice(0, 4).join("、")}

以下の各ファイルについて、そのまま動作する完全な実装コードを生成してください(雛形やTODOコメントではなく本実装):
${requested.map((f) => `- ${f.path}: ${f.summary}`).join("\n")}

制約:
- TypeScriptはstrictで型エラーなし、外部パッケージは技術スタックの標準的なもののみ
- 各ファイルは自己完結し、相互のimportパスが整合していること
- セキュリティ(入力検証・認可)とエラーハンドリングを省略しないこと`;

  try {
    const result = await generateStructured<GenerateResult>({
      system:
        "あなたは複数のシニアエンジニアからなる実装チームです。プロダクション品質の完全なコードのみを生成します。",
      prompt,
      toolName: "submit_implementation",
      toolDescription: "各ファイルの完全な実装コードを提出する",
      inputSchema: {
        properties: {
          files: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                content: { type: "string" },
              },
              required: ["path", "content"],
            },
          },
        },
        required: ["files"],
      },
      maxTokens: 16000,
      timeoutMs: 120_000,
    });

    // 要求したパスのみ許可(パス注入対策)し、サイズ上限を適用
    const allowed = new Set(requested.map((f) => f.path));
    const files = (result.files ?? [])
      .filter((f) => allowed.has(f.path) && typeof f.content === "string" && f.content.length > 0)
      .map((f) => ({ path: f.path, content: f.content.slice(0, MAX_CONTENT) }));
    if (files.length === 0) throw new Error("empty generation");
    return NextResponse.json({ ok: true, files });
  } catch {
    // APIキー未設定・タイムアウト等: スキャフォールドへフォールバック
    return NextResponse.json({ ok: false, fallback: true });
  }
}
