import type { QualificationView } from "@/lib/game/qualifications";

// MVP: ルールベースの「次に作ると良いアプリ」提案。
// 有料AIを使わず、プレイヤーのレベルと学習中/合格済みの資格カテゴリから
// あらかじめ用意した候補の中から絞り込むだけのシンプルな仕組み。

export type ProjectDifficulty = "easy" | "normal" | "hard" | "expert";

export type ProjectIdea = {
  id: string;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  categories: string[]; // QualificationView.category と対応。"general"は誰にでも合う候補。
};

const PROJECT_IDEAS: ProjectIdea[] = [
  {
    id: "todo_app",
    title: "TODOアプリ",
    description: "CRUD操作とローカル保存を一通り経験できる定番の題材です。",
    difficulty: "easy",
    categories: ["general"],
  },
  {
    id: "expense_tracker",
    title: "家計簿アプリ",
    description: "入力フォーム・集計・グラフ表示までを一気通貫で練習できます。",
    difficulty: "easy",
    categories: ["general", "Python"],
  },
  {
    id: "markdown_notes",
    title: "Markdownメモアプリ",
    description: "テキスト処理とプレビュー表示のUIを組み合わせる練習になります。",
    difficulty: "easy",
    categories: ["general"],
  },
  {
    id: "url_shortener",
    title: "URL短縮サービス",
    description: "簡単なAPIサーバーとDB設計の基礎を学べる定番のお題です。",
    difficulty: "normal",
    categories: ["general", "Java", "Python", "Ruby"],
  },
  {
    id: "blog_cms",
    title: "簡易CMS(ブログ管理システム)",
    description: "認証・記事のCRUD・権限管理まで含む本格的なWebアプリ題材です。",
    difficulty: "normal",
    categories: ["Java", "Ruby", "Python", "情報処理"],
  },
  {
    id: "inventory_system",
    title: "在庫管理システム",
    description: "業務システムでよくあるマスタ管理・トランザクション処理を練習できます。",
    difficulty: "normal",
    categories: ["Java", "情報処理", "プロジェクト管理"],
  },
  {
    id: "serverless_api",
    title: "サーバーレスAPI",
    description: "クラウドの関数実行サービスを使い、インフラ管理なしでAPIを公開してみましょう。",
    difficulty: "normal",
    categories: ["AWS", "Azure", "GCP"],
  },
  {
    id: "ci_cd_pipeline",
    title: "自作CI/CDパイプライン",
    description: "コンテナ化したアプリを自動テスト・自動デプロイする仕組みを構築してみましょう。",
    difficulty: "hard",
    categories: ["Kubernetes", "Linux", "AWS", "Azure", "GCP"],
  },
  {
    id: "container_orchestration",
    title: "コンテナオーケストレーション基盤",
    description: "複数サービスをKubernetes上で運用し、スケーリングや監視を体験してみましょう。",
    difficulty: "hard",
    categories: ["Kubernetes", "Linux"],
  },
  {
    id: "auth_platform",
    title: "認証基盤(SSO/OAuth対応)",
    description: "セキュリティ要件を意識した認証・認可の仕組みを自作してみましょう。",
    difficulty: "hard",
    categories: ["セキュリティ", "情報処理"],
  },
  {
    id: "realtime_chat",
    title: "リアルタイムチャットアプリ",
    description: "WebSocketなどを使い、双方向通信のあるアプリに挑戦してみましょう。",
    difficulty: "normal",
    categories: ["general", "Java", "Python", "Ruby"],
  },
  {
    id: "task_automation_bot",
    title: "定型作業を自動化するBot",
    description: "日々の繰り返し作業をスクリプトで自動化し、実務に近い効率化を体験できます。",
    difficulty: "easy",
    categories: ["general", "Python", "Linux"],
  },
  {
    id: "distributed_job_queue",
    title: "分散ジョブキューシステム",
    description: "大量のタスクを複数ワーカーで非同期処理する、スケーラブルな設計に挑戦しましょう。",
    difficulty: "expert",
    categories: ["Kubernetes", "AWS", "情報処理"],
  },
  {
    id: "microservices_platform",
    title: "マイクロサービス基盤",
    description: "複数の小さなサービスに分割し、サービス間通信・障害耐性を設計してみましょう。",
    difficulty: "expert",
    categories: ["Kubernetes", "AWS", "Azure", "GCP", "プロジェクト管理"],
  },
  {
    id: "team_dashboard",
    title: "チーム向け進捗ダッシュボード",
    description: "スクラムのベロシティやタスク状況を可視化するツールを作ってみましょう。",
    difficulty: "normal",
    categories: ["アジャイル", "プロジェクト管理"],
  },
];

export type ProjectSuggestion = {
  idea: ProjectIdea;
  reason: string;
};

function difficultyForLevel(level: number): ProjectDifficulty {
  if (level < 10) return "easy";
  if (level < 30) return "normal";
  if (level < 50) return "hard";
  return "expert";
}

const DIFFICULTY_ORDER: ProjectDifficulty[] = ["easy", "normal", "hard", "expert"];

function closestDifficultyIdeas(
  ideas: ProjectIdea[],
  target: ProjectDifficulty
): ProjectIdea[] {
  const targetIndex = DIFFICULTY_ORDER.indexOf(target);
  let radius = 0;
  while (radius <= DIFFICULTY_ORDER.length) {
    const candidates = ideas.filter((idea) => {
      const diff = Math.abs(DIFFICULTY_ORDER.indexOf(idea.difficulty) - targetIndex);
      return diff === radius;
    });
    if (candidates.length > 0) return candidates;
    radius += 1;
  }
  return ideas;
}

/**
 * プレイヤーのレベルと資格カテゴリから、次に作ってみると良いアプリを最大3件提案する。
 * 同じ日は同じ並び順になるよう日付をシードにした決定的な並び替えを行う。
 */
export function getNextProjectSuggestions(
  level: number,
  qualifications: QualificationView[] | null
): ProjectSuggestion[] {
  const targetDifficulty = difficultyForLevel(level);
  const activeCategory = qualifications?.find(
    (q) => q.status === "learning" || q.status === "planning"
  )?.category;
  const passedCategory = qualifications?.find((q) => q.status === "passed")?.category;
  const preferredCategory = activeCategory ?? passedCategory ?? null;

  let pool = preferredCategory
    ? PROJECT_IDEAS.filter((idea) => idea.categories.includes(preferredCategory))
    : [];
  if (pool.length === 0) {
    pool = PROJECT_IDEAS.filter((idea) => idea.categories.includes("general"));
  }
  if (pool.length === 0) {
    pool = PROJECT_IDEAS;
  }

  const matched = closestDifficultyIdeas(pool, targetDifficulty);

  // 日付をシードにした決定的シャッフルで、同じ日は同じ提案順になるようにする。
  const seed = new Date().toISOString().slice(0, 10);
  const seeded = matched
    .map((idea, index) => ({
      idea,
      key: `${seed}-${idea.id}-${index}`.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
    }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.idea);

  return seeded.slice(0, 3).map((idea) => ({
    idea,
    reason: preferredCategory
      ? `${preferredCategory}の学習に合わせて、レベルに見合う難易度で選定しました。`
      : "現在のレベルに合わせて、汎用的な題材から選定しました。",
  }));
}
