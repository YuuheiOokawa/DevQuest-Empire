import type {
  ActionsStepId,
  MarketSource,
  StudioPhaseId,
  StudioRole,
} from "@/services/aiStudioTypes";

// AI開発スタジオのルールベース生成素材。
// 市場調査は実際のスクレイピングを行わず、公開情報を元にした
// ダミー知見を生成する(将来実データ連携に差し替え可能)。

export const MARKET_FINDINGS: { source: MarketSource; finding: string; opportunity: string }[] = [
  { source: "GitHub", finding: "習慣化系OSSのStarが先月比+40%", opportunity: "習慣化×ゲーミフィケーションの需要が続いている" },
  { source: "GitHub", finding: "個人開発向けボイラープレートのForkが急増", opportunity: "セットアップ済みテンプレの提供価値が高い" },
  { source: "Product Hunt", finding: "AI日記アプリが週間1位を獲得", opportunity: "AIによる振り返り支援は差別化しやすい" },
  { source: "Product Hunt", finding: "ノーコード家計簿がUpvote 800超", opportunity: "入力の手間削減が最重要の訴求点" },
  { source: "Google Play", finding: "学習系アプリのDL数が試験シーズンで急増", opportunity: "資格試験カレンダー連動の企画が有望" },
  { source: "App Store", finding: "筋トレ記録アプリの課金率が上昇傾向", opportunity: "パーソナライズ提案は課金導線になる" },
  { source: "Reddit", finding: "r/productivityでタスク細分化手法が話題", opportunity: "タスク自動分解機能はバズの種になる" },
  { source: "Hacker News", finding: "ローカルファーストアプリの議論が活発", opportunity: "オフライン対応を前面に出すと刺さる層がいる" },
  { source: "トレンド", finding: "「推し活 管理」の検索数が増加", opportunity: "推し活×スケジュールのニッチ市場が狙える" },
  { source: "トレンド", finding: "副業ポートフォリオ需要が堅調", opportunity: "実績整理を自動化するツールに商機" },
];

export const REPO_NAME_POOL = [
  "study-quest", "habit-ai", "travel-planner", "github-analyzer", "expense-manager",
  "fitness-rpg", "recipe-book", "resume-builder", "ai-calendar", "task-master",
  "diary-lens", "oshi-manager", "focus-flow", "mind-garden", "skill-tree",
];

export const PROPOSAL_CATEGORIES = [
  { category: "学習", problems: ["学習の継続が難しい", "進捗が見えず挫折する"], targets: ["資格取得を目指す社会人", "独学のエンジニア志望者"] },
  { category: "健康", problems: ["運動習慣が続かない", "食事管理が面倒"], targets: ["在宅勤務の会社員", "ジム初心者"] },
  { category: "生産性", problems: ["タスクが多すぎて優先順位が付かない", "集中が続かない"], targets: ["マルチタスクのフリーランス", "若手ビジネスパーソン"] },
  { category: "家計", problems: ["支出の全体像が掴めない", "記録が三日坊主になる"], targets: ["一人暮らしの新社会人", "家計を見直したい夫婦"] },
  { category: "開発者ツール", problems: ["自分の開発活動を客観視できない", "ポートフォリオ作成に時間がかかる"], targets: ["転職準備中のエンジニア", "OSS初心者"] },
  { category: "ライフログ", problems: ["日々の記録が続かない", "思い出を振り返る機会がない"], targets: ["日記を続けたい20代", "子育て中の親"] },
];

export const FEATURE_POOL = [
  "ストリーク表示", "AIによる週次サマリー", "リマインダー", "ダークモード", "データエクスポート",
  "ソーシャル共有カード", "オフライン対応", "ウィジェット", "目標設定", "グラフ分析",
  "テンプレート機能", "タグ管理", "検索", "バックアップ同期",
];

export const TECH_STACKS = [
  ["Next.js", "TypeScript", "Supabase", "Vercel"],
  ["Next.js", "TypeScript", "NestJS", "PostgreSQL", "Docker"],
  ["React Native", "TypeScript", "FastAPI", "PostgreSQL"],
  ["Flutter", "Go", "PostgreSQL", "Docker"],
  ["Vue", "TypeScript", "Node.js", "Supabase"],
  ["Next.js", "TypeScript", "Spring Boot", "PostgreSQL", "GitHub Actions"],
];

export const BUSINESS_MODELS = [
  "フリーミアム(月額480円のProプラン)",
  "月額サブスクリプション(300円)",
  "買い切り(1,200円)+追加テンプレ課金",
  "広告+広告非表示課金",
];

export const QUALITY_TARGETS = ["クラッシュ率0.1%未満・ストア評価4.5以上", "Lighthouse 90点以上・テストカバレッジ80%", "初回表示1秒以内・エラーバジェット月0.1%"];

// 開発工程(承認ゲート込み)。roleは主担当。
export const STUDIO_PHASES: { id: StudioPhaseId; label: string; role: StudioRole | null; approval?: "repository" | "push" | "merge" | "deploy" }[] = [
  { id: "idea", label: "Idea", role: "Product Manager" },
  { id: "requirements", label: "Requirements", role: "Product Manager" },
  { id: "architecture", label: "Architecture", role: "Architect" },
  { id: "database", label: "Database", role: "Database Engineer" },
  { id: "api", label: "API", role: "Backend Engineer" },
  { id: "uiDesign", label: "UI Design", role: "UI Designer" },
  { id: "frontend", label: "Frontend", role: "Frontend Engineer" },
  { id: "backend", label: "Backend", role: "Backend Engineer" },
  { id: "testing", label: "Testing", role: "QA Engineer" },
  { id: "review", label: "Review", role: "Reviewer" },
  { id: "documentation", label: "Documentation", role: "Technical Writer" },
  { id: "releaseCandidate", label: "Release Candidate", role: "Project Manager" },
  { id: "approvalRepo", label: "Human Approval(Repo作成)", role: null, approval: "repository" },
  { id: "repoCreate", label: "GitHub Repository作成", role: "DevOps Engineer" },
  { id: "commit", label: "Commit", role: "Frontend Engineer" },
  { id: "approvalPush", label: "Human Approval(Push)", role: null, approval: "push" },
  { id: "push", label: "Push", role: "DevOps Engineer" },
  { id: "pullRequest", label: "Pull Request", role: "Backend Engineer" },
  { id: "approvalMerge", label: "Human Approval(Merge)", role: null, approval: "merge" },
  { id: "merge", label: "Merge", role: "Reviewer" },
  { id: "actionsRun", label: "GitHub Actions", role: "DevOps Engineer" },
  { id: "approvalDeploy", label: "Human Approval(Deploy)", role: null, approval: "deploy" },
  { id: "deploy", label: "Deploy", role: "DevOps Engineer" },
];

// Claude Codeへ送るプロンプトのテンプレート(工程→役割別)
export const CLAUDE_PROMPTS: Partial<Record<StudioPhaseId, { role: StudioRole; title: string; prompt: string }>> = {
  architecture: {
    role: "Architect",
    title: "システム設計",
    prompt: "あなたはシニアアーキテクトです。{app}({category}アプリ)のシステム設計をしてください。技術スタックは{stack}。レイヤー構成・主要モジュール・データフローをMarkdownで出力してください。",
  },
  database: {
    role: "Database Engineer",
    title: "DBスキーマ作成",
    prompt: "{app}のデータベーススキーマを設計してください。主要エンティティ・リレーション・インデックスを含むDDL(PostgreSQL)を出力してください。",
  },
  api: {
    role: "Backend Engineer",
    title: "認証APIを作成",
    prompt: "{app}の認証API(サインアップ/ログイン/セッション管理)を作成してください。技術スタックは{stack}。バリデーションとエラーハンドリングを含めてください。",
  },
  uiDesign: {
    role: "UI Designer",
    title: "デザイントークン定義",
    prompt: "{app}のデザイントークン(色・タイポグラフィ・余白)とコンポーネント一覧を定義してください。モバイルファーストで。",
  },
  frontend: {
    role: "Frontend Engineer",
    title: "ホーム画面を作成",
    prompt: "{app}のホーム画面を作成してください。主要機能: {features}。レスポンシブ対応・ローディング/エラー状態も実装してください。",
  },
  backend: {
    role: "Backend Engineer",
    title: "コアAPIを実装",
    prompt: "{app}のコア機能({features})のCRUD APIを実装してください。サービス層とリポジトリパターンで分離してください。",
  },
  testing: {
    role: "QA Engineer",
    title: "テストを書く",
    prompt: "{app}の主要フローのテストを書いてください。単体テストとE2Eテスト(正常系+境界値)をカバレッジ80%目標で。",
  },
  review: {
    role: "Reviewer",
    title: "コードレビュー",
    prompt: "このプロジェクトの変更をレビューしてください。命名・責務分割・エラーハンドリング・セキュリティの観点で指摘し、修正案を提示してください。",
  },
  documentation: {
    role: "Technical Writer",
    title: "README作成",
    prompt: "{app}のREADMEを作成してください。概要・セットアップ手順・使い方・技術スタック・ライセンスを含めてください。",
  },
};

// 工程ごとの変更予定ファイル(担当役割つき)
export const FILE_PLANS: Partial<Record<StudioPhaseId, { path: string; action: "add" | "modify"; summary: string; role: StudioRole }[]>> = {
  architecture: [
    { path: "docs/architecture.md", action: "add", summary: "システム構成図と設計方針", role: "Architect" },
    { path: ".github/workflows/ci.yml", action: "add", summary: "CIパイプライン定義", role: "DevOps Engineer" },
  ],
  database: [
    { path: "database/schema.sql", action: "add", summary: "初期スキーマDDL", role: "Database Engineer" },
    { path: "src/lib/db.ts", action: "add", summary: "DBクライアント初期化", role: "Database Engineer" },
  ],
  api: [
    { path: "src/services/authService.ts", action: "add", summary: "認証ロジック", role: "Backend Engineer" },
    { path: "src/app/api/auth/route.ts", action: "add", summary: "認証エンドポイント", role: "Backend Engineer" },
  ],
  uiDesign: [
    { path: "src/lib/tokens.ts", action: "add", summary: "デザイントークン", role: "UI Designer" },
    { path: "docs/screen-design.md", action: "add", summary: "画面設計書", role: "UX Designer" },
  ],
  frontend: [
    { path: "src/app/page.tsx", action: "add", summary: "ホーム画面", role: "Frontend Engineer" },
    { path: "src/components/AppShell.tsx", action: "add", summary: "共通レイアウト", role: "Frontend Engineer" },
    { path: "src/hooks/useAppData.ts", action: "add", summary: "データ取得フック", role: "Frontend Engineer" },
  ],
  backend: [
    { path: "src/services/coreService.ts", action: "add", summary: "コア機能ロジック", role: "Backend Engineer" },
    { path: "src/app/api/items/route.ts", action: "add", summary: "CRUDエンドポイント", role: "Backend Engineer" },
  ],
  testing: [
    { path: "tests/core.spec.ts", action: "add", summary: "単体テスト", role: "QA Engineer" },
    { path: "tests/e2e/home.e2e.ts", action: "add", summary: "E2Eテスト", role: "QA Engineer" },
  ],
  review: [
    { path: "src/services/coreService.ts", action: "modify", summary: "レビュー指摘の責務分割", role: "Reviewer" },
  ],
  documentation: [
    { path: "README.md", action: "add", summary: "プロジェクト概要とセットアップ", role: "Technical Writer" },
    { path: "docs/CHANGELOG.md", action: "add", summary: "変更履歴", role: "Technical Writer" },
  ],
};

export const ACTIONS_STEPS: { id: ActionsStepId; label: string; detail: string }[] = [
  { id: "lint", label: "Lint", detail: "ESLint 0 errors" },
  { id: "typecheck", label: "Type Check", detail: "tsc --noEmit 0 errors" },
  { id: "build", label: "Build", detail: "next build 成功" },
  { id: "unitTest", label: "Unit Test", detail: "42 passed" },
  { id: "integrationTest", label: "Integration Test", detail: "12 passed" },
  { id: "coverage", label: "Coverage", detail: "84%(目標80%)" },
  { id: "securityScan", label: "Security Scan", detail: "Critical 0 / High 0" },
  { id: "artifact", label: "Artifact", detail: "ビルド成果物を保存" },
];

export const MEETING_AGENDAS = [
  { agenda: "新機能の優先順位", lines: ["ユーザー要望トップはウィジェット対応です", "工数的には次スプリントで入れられます", "収益貢献は薄いので優先度は中では?"], decision: "ウィジェット対応を次スプリント候補に追加" },
  { agenda: "改善バックログの棚卸し", lines: ["起動時間の改善が最も効果的です", "画像の遅延読み込みで1秒縮められます", "計測を入れてから判断しましょう"], decision: "パフォーマンス計測を先行導入する" },
  { agenda: "バグトリアージ", lines: ["再現率100%のクラッシュが1件あります", "影響ユーザーは全体の3%です", "ホットフィックスを切りましょう"], decision: "クラッシュ修正を最優先で対応" },
  { agenda: "売上レビュー", lines: ["課金転換率は2.1%で横ばいです", "オンボーディング改善後に継続率が+5pt", "価格テストを提案します"], decision: "来月からABテストで価格検証を開始" },
  { agenda: "設計レビュー", lines: ["通知基盤はキュー化すべきです", "現状の同期処理はスケールしません", "段階的に移行しましょう"], decision: "通知処理を非同期キューへ段階移行" },
  { agenda: "リファクタリング計画", lines: ["重複コードが増えています", "共通フックに寄せられます", "テストを先に固めてから着手しましょう"], decision: "テスト整備→共通化の順で実施" },
];
