import type { AppIdea, DesignDoc, DesignDocType } from "@/services/aiCompanyTypes";

// AI社員が工程完了時に自動生成する設計書(ダミー生成・毎回内容が変わる)。
// 将来AI APIに置き換える場合はbuildDoc内の生成ロジックを差し替える。

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DOC_TITLES: Record<DesignDocType, string> = {
  charter: "Project Charter",
  requirements: "要件定義書",
  screenDesign: "画面設計書",
  dbDesign: "DB設計書(ER図)",
  apiDesign: "API設計書",
  folderStructure: "フォルダ構成",
  techStack: "技術スタック",
  implPlan: "実装計画",
  releasePlan: "リリース計画",
  mvpScope: "MVPスコープ",
  risk: "リスク一覧",
  backlog: "プロダクトバックログ",
  sprint: "スプリント計画",
  review: "レビュー記録",
};

const STACKS = [
  ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
  ["Vue", "TypeScript", "Fastify", "MySQL"],
  ["React Native", "TypeScript", "Go", "PostgreSQL"],
  ["Next.js", "TypeScript", "Spring Boot", "PostgreSQL"],
  ["Flutter", "Dart", "Go", "Firebase"],
];

const AUTH_METHODS = ["OAuth 2.0 + セッション", "メールリンク認証", "OAuth 2.0 + JWT", "パスキー対応"];
const RISKS = [
  "スコープ肥大化により納期が伸びる",
  "外部API仕様変更の影響を受ける",
  "初期ユーザー獲得が想定を下回る",
  "類似アプリの先行リリース",
  "ストア審査でのリジェクト",
  "キーメンバーの稼働逼迫",
];

function tableNamesFor(idea: AppIdea): string[] {
  const base = ["users", "settings", "notifications"];
  const byGenre: Record<string, string[]> = {
    資格学習アプリ: ["questions", "answers", "study_logs", "exams"],
    家計簿アプリ: ["transactions", "categories", "budgets"],
    筋トレ管理アプリ: ["workouts", "exercises", "records"],
    タスク管理アプリ: ["tasks", "projects", "labels"],
    日記アプリ: ["entries", "moods", "photos"],
    レシピアプリ: ["recipes", "ingredients", "meal_plans"],
    旅行計画アプリ: ["trips", "spots", "itineraries"],
    GitHub分析アプリ: ["repos", "commits_cache", "reports"],
    ポートフォリオ作成アプリ: ["portfolios", "works", "templates"],
    メンタルケアアプリ: ["checkins", "sessions", "sounds"],
  };
  return [...base, ...(byGenre[idea.genre] ?? ["items", "records"])];
}

export function buildDoc(type: DesignDocType, idea: AppIdea, turn: number): DesignDoc {
  const tables = tableNamesFor(idea);
  const stack = pick(STACKS);
  const screens = ["ホーム", "一覧", "詳細", "作成/編集", "設定", "オンボーディング"]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4 + Math.floor(Math.random() * 2));

  const linesMap: Record<DesignDocType, string[]> = {
    charter: [
      `プロダクト名: ${idea.name}`,
      `目的: ${idea.problem}を解決する`,
      `ターゲット: ${idea.target}`,
      `提供価値: ${idea.solution}`,
      `成功指標: リリース後3ヶ月で継続率${25 + Math.floor(Math.random() * 20)}%`,
    ],
    requirements: [
      ...idea.features.map((f, i) => `FR-${i + 1}: ${f}を提供する`),
      `NFR-1: 主要画面の初回表示を${1 + Math.floor(Math.random() * 2)}秒以内にする`,
      "NFR-2: オフライン時も閲覧系機能を利用可能にする",
    ],
    screenDesign: [
      `画面数: ${screens.length}画面`,
      ...screens.map((s, i) => `S-${i + 1}: ${s}画面`),
      "ナビゲーション: 下部タブ+モーダル",
    ],
    dbDesign: [
      `テーブル数: ${tables.length}`,
      ...tables.map((t) => `- ${t}`),
      "リレーション: users 1-N " + tables[3 % tables.length],
    ],
    apiDesign: [
      `方式: REST(全${8 + Math.floor(Math.random() * 8)}エンドポイント)`,
      `- GET /api/${tables[3 % tables.length]}`,
      `- POST /api/${tables[3 % tables.length]}`,
      `- PATCH /api/${tables[3 % tables.length]}/:id`,
      "- GET /api/me",
      "エラー形式: RFC 9457 Problem Details",
    ],
    folderStructure: [
      "src/",
      "  app/ … 画面(App Router)",
      "  components/ … UI部品",
      "  services/ … ビジネスロジック",
      "  lib/ … 共通ユーティリティ",
      "  data/ … マスタデータ",
    ],
    techStack: [
      ...stack.map((s) => `- ${s}`),
      `認証: ${pick(AUTH_METHODS)}`,
      "ホスティング: マネージドクラウド",
    ],
    implPlan: [
      `スプリント構成: ${2 + Math.floor(Math.random() * 2)}週間 × ${3 + Math.floor(Math.random() * 3)}本`,
      "Sprint 1: 基盤+認証+主要画面の骨組み",
      "Sprint 2: コア機能の実装",
      "Sprint 3: 品質改善+β公開準備",
    ],
    releasePlan: [
      "β版: 先行ユーザーに限定公開しフィードバックを収集",
      `正式版: β開始の${2 + Math.floor(Math.random() * 3)}週間後`,
      "ロールバック手順: 直前バージョンへの即時切り戻しを用意",
    ],
    mvpScope: [
      `IN: ${idea.features.slice(0, 3).join(" / ")}`,
      `OUT: ${pick(["ソーシャル共有", "多言語対応", "Web版", "チーム機能"])}(次期フェーズ)`,
      `収益化: ${idea.monetization}`,
    ],
    risk: [...RISKS].sort(() => Math.random() - 0.5).slice(0, 3).map((r, i) => `R-${i + 1}: ${r}`),
    backlog: [
      ...idea.features.map((f, i) => `#${i + 1} ${f}(優先度: ${i < 2 ? "高" : "中"})`),
      `#${idea.features.length + 1} ${pick(["ダークモード", "ウィジェット", "データエクスポート"])}(優先度: 低)`,
    ],
    sprint: [
      `Sprint ${1 + Math.floor(Math.random() * 3)} 目標: コア機能を動く状態にする`,
      `ベロシティ想定: ${18 + Math.floor(Math.random() * 10)}pt`,
      "デイリー: 毎朝10分の同期ミーティング",
    ],
    review: [
      `指摘件数: ${2 + Math.floor(Math.random() * 4)}件(重要度高 ${1 + Math.floor(Math.random() * 2)}件)`,
      "主な指摘: 責務分割 / 命名統一 / テスト追加",
      "対応方針: 重要度高は即修正、他はバックログへ",
    ],
  };

  return {
    id: `doc-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title: DOC_TITLES[type],
    lines: linesMap[type],
    turn,
  };
}
