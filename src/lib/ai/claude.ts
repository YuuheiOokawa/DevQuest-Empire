import Anthropic from "@anthropic-ai/sdk";
import { Agent } from "undici";

// 社内ネットワークのTLS中間プロキシにより証明書検証が失敗するため、
// このクライアントに限定してTLS検証をスキップする(lib/prisma.tsと同様の対応)。
const insecureDispatcher = new Agent({
  connect: { rejectUnauthorized: false },
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  fetchOptions: { dispatcher: insecureDispatcher },
});

// 軽量・低コストなモデルを使用する(18_Phase3_Detailed_Design.md Part4)
export const AI_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_TIMEOUT_MS = 5000;

type StructuredParams = {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: {
    properties: Record<string, unknown>;
    required: string[];
  };
  maxTokens?: number;
  timeoutMs?: number;
};

/**
 * Tool Use(Structured Output)を使い、AIにJSONスキーマに沿った出力のみを
 * 生成させる。ハルシネーション対策として、数値(経験値等)はAIに直接
 * 生成させず、呼び出し側で固定テーブルに変換する。
 */
export async function generateStructured<T>(params: StructuredParams): Promise<T> {
  const response = await anthropic.messages.create(
    {
      model: AI_MODEL,
      max_tokens: params.maxTokens ?? 300,
      system: params.system,
      messages: [{ role: "user", content: params.prompt }],
      tools: [
        {
          name: params.toolName,
          description: params.toolDescription,
          input_schema: {
            type: "object",
            properties: params.inputSchema.properties,
            required: params.inputSchema.required,
          },
        },
      ],
      tool_choice: { type: "tool", name: params.toolName },
    },
    { timeout: params.timeoutMs ?? DEFAULT_TIMEOUT_MS }
  );

  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("AIからのStructured Output取得に失敗しました");
  }

  return toolUseBlock.input as T;
}
