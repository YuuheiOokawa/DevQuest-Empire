import type { StudioProject } from "@/services/aiStudioTypes";

// ルールベースの実装コード生成(APIキー不要)。
// Pushされるリポジトリを「TODO雛形」ではなく、clone→npm install→npm run devで
// 実際に動くNext.js+TypeScriptアプリ(localStorage永続化・サービス層/リポジトリ層分離・
// 単体テスト付き)として生成する。カテゴリ名・機能名はプロジェクト企画から埋め込む。
// ANTHROPIC_API_KEY設定時はこの上にClaude API生成コードが上書きされる(generate-code)。

export function buildRealScaffold(project: StudioProject): { path: string; content: string }[] {
  const p = project.proposal;
  const app = p.appName;
  const desc = `${p.problem}を解決する${p.category}アプリ`;

  return [
    {
      path: "package.json",
      content: `{
  "name": "${p.repoName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
    },
    {
      path: ".gitignore",
      content: `node_modules/
.next/
out/
*.log
.env*
!.env.example
coverage/
`,
    },
    {
      path: "src/app/layout.tsx",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${app}",
  description: "${desc}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
`,
    },
    {
      path: "src/app/globals.css",
      content: `:root { --fg: #111827; --muted: #6b7280; --line: #e5e7eb; --accent: #059669; --bg: #f9fafb; }
* { box-sizing: border-box; margin: 0; }
body { font-family: system-ui, -apple-system, "Hiragino Sans", sans-serif; color: var(--fg); background: var(--bg); }
main { max-width: 640px; margin: 0 auto; padding: 32px 16px; display: grid; gap: 16px; }
h1 { font-size: 22px; }
.card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px; display: grid; gap: 10px; }
.muted { color: var(--muted); font-size: 13px; }
form { display: grid; gap: 8px; }
input, textarea { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font-size: 14px; width: 100%; }
button { border: 0; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-weight: 600; cursor: pointer; background: var(--accent); color: #fff; }
button.ghost { background: transparent; color: var(--muted); font-weight: 400; }
ul { list-style: none; display: grid; gap: 8px; }
li { border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; background: #fff; display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stat { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 12px; text-align: center; }
.stat b { font-size: 20px; display: block; }
.error { color: #dc2626; font-size: 12px; }
`,
    },
    {
      path: "src/lib/types.ts",
      content: `// ${app} のドメイン型定義
export type Entry = {
  id: string;
  title: string;
  amount: number; // ${p.category}の記録値(回数・金額など)
  note: string;
  createdAt: string; // ISO 8601
};

export type EntryInput = {
  title: string;
  amount: number;
  note: string;
};
`,
    },
    {
      path: "src/lib/logic.ts",
      content: `import type { Entry, EntryInput } from "./types";

// 純粋ロジック(バリデーション・集計)。DOM/ストレージに依存しないため単体テスト可能。

export function validateEntry(input: EntryInput): string | null {
  if (!input.title.trim()) return "タイトルを入力してください";
  if (input.title.length > 100) return "タイトルは100文字以内で入力してください";
  if (!Number.isFinite(input.amount) || input.amount < 0) return "数値は0以上で入力してください";
  if (input.note.length > 500) return "メモは500文字以内で入力してください";
  return null;
}

export function summarize(entries: Entry[]): { count: number; total: number; streakDays: number } {
  const count = entries.length;
  const total = entries.reduce((s, e) => s + e.amount, 0);

  // 連続記録日数: 今日から遡って記録が途切れるまで数える
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  let streakDays = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { count, total, streakDays };
}
`,
    },
    {
      path: "src/services/entryRepository.ts",
      content: `import type { Entry } from "@/lib/types";

// リポジトリ層: 永続化の実装詳細を隔離する。
// MVPはlocalStorage。将来Supabase/PostgreSQLへ差し替える場合はこのファイルのみ変更する。

const STORAGE_KEY = "${p.repoName}-entries-v1";

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* 容量超過時は保存をスキップ(UIは動作継続) */
  }
}
`,
    },
    {
      path: "src/services/entryService.ts",
      content: `import { validateEntry } from "@/lib/logic";
import type { Entry, EntryInput } from "@/lib/types";
import { loadEntries, saveEntries } from "./entryRepository";

// サービス層: ビジネスルール(検証→生成→保存)を集約する。

export function listEntries(): Entry[] {
  return loadEntries().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addEntry(input: EntryInput): { ok: true; entry: Entry } | { ok: false; error: string } {
  const error = validateEntry(input);
  if (error) return { ok: false, error };
  const entry: Entry = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    amount: input.amount,
    note: input.note.trim(),
    createdAt: new Date().toISOString(),
  };
  saveEntries([entry, ...loadEntries()]);
  return { ok: true, entry };
}

export function removeEntry(id: string): void {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}
`,
    },
    {
      path: "src/app/page.tsx",
      content: `"use client";

import { useEffect, useState } from "react";
import { summarize } from "@/lib/logic";
import type { Entry } from "@/lib/types";
import { addEntry, listEntries, removeEntry } from "@/services/entryService";

// ${app} — ${desc}。
// 主要機能: ${p.features.join(" / ")}
export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(listEntries());
    setLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addEntry({ title, amount: Number(amount), note });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setTitle("");
    setAmount("1");
    setNote("");
    setEntries(listEntries());
  };

  const handleRemove = (id: string) => {
    removeEntry(id);
    setEntries(listEntries());
  };

  const stats = summarize(entries);

  return (
    <main>
      <div>
        <h1>${app}</h1>
        <p className="muted">${desc}(データはこの端末に保存されます)</p>
      </div>

      <div className="stats">
        <div className="stat"><b>{stats.count}</b><span className="muted">記録数</span></div>
        <div className="stat"><b>{stats.total.toLocaleString()}</b><span className="muted">合計</span></div>
        <div className="stat"><b>{stats.streakDays}日</b><span className="muted">連続記録</span></div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} aria-label="記録を追加">
          <label>
            タイトル
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="今日の${p.category}" />
          </label>
          <label>
            数値(回数・金額など)
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            メモ(任意)
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit">記録する</button>
        </form>
      </div>

      <div className="card">
        <h2>履歴</h2>
        {!loaded ? (
          <p className="muted">読み込み中...</p>
        ) : entries.length === 0 ? (
          <p className="muted">まだ記録がありません。最初の記録を追加しましょう。</p>
        ) : (
          <ul>
            {entries.map((e) => (
              <li key={e.id}>
                <span>
                  <strong>{e.title}</strong>{" "}
                  <span className="muted">
                    {e.amount.toLocaleString()} ・ {e.createdAt.slice(0, 10)}
                    {e.note ? \` ・ \${e.note}\` : ""}
                  </span>
                </span>
                <button type="button" className="ghost" onClick={() => handleRemove(e.id)} aria-label="削除">
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
`,
    },
    {
      path: "tests/logic.test.ts",
      content: `import { describe, expect, it } from "vitest";
import { summarize, validateEntry } from "../src/lib/logic";
import type { Entry } from "../src/lib/types";

describe("validateEntry", () => {
  it("正常な入力を受理する", () => {
    expect(validateEntry({ title: "テスト", amount: 1, note: "" })).toBeNull();
  });
  it("空タイトルを拒否する", () => {
    expect(validateEntry({ title: "  ", amount: 1, note: "" })).not.toBeNull();
  });
  it("負の数値を拒否する", () => {
    expect(validateEntry({ title: "a", amount: -1, note: "" })).not.toBeNull();
  });
  it("境界値: タイトル100文字は受理、101文字は拒否", () => {
    expect(validateEntry({ title: "a".repeat(100), amount: 0, note: "" })).toBeNull();
    expect(validateEntry({ title: "a".repeat(101), amount: 0, note: "" })).not.toBeNull();
  });
});

describe("summarize", () => {
  const entry = (daysAgo: number, amount: number): Entry => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return { id: String(daysAgo), title: "t", amount, note: "", createdAt: d.toISOString() };
  };
  it("件数と合計を集計する", () => {
    const s = summarize([entry(0, 10), entry(1, 5)]);
    expect(s.count).toBe(2);
    expect(s.total).toBe(15);
  });
  it("連続記録日数を数える(今日+昨日=2日)", () => {
    expect(summarize([entry(0, 1), entry(1, 1)]).streakDays).toBe(2);
  });
  it("今日の記録がなければ連続0日", () => {
    expect(summarize([entry(2, 1)]).streakDays).toBe(0);
  });
});
`,
    },
    {
      path: "vitest.config.ts",
      content: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
`,
    },
  ];
}

/** 実際にnpm install→typecheck→test→buildを実行するCIワークフロー。 */
export function buildRealCiYaml(appName: string): string {
  return `name: CI
on:
  push:
    branches: ["**"]
  pull_request:
  workflow_dispatch:

jobs:
  ci:
    name: CI (${appName})
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install
        run: npm install --no-audit --no-fund
      - name: Type Check
        run: npx tsc --noEmit
      - name: Unit Test
        run: npx vitest run
      - name: Build
        run: npm run build
      - name: Security Scan
        run: npm audit --audit-level=critical
      - name: Artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
          include-hidden-files: true
`;
}
