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
  "study-quest", "habit-ai", "travel-planner", "github-dashboard", "expense-manager",
  "fitness-rpg", "recipe-book", "resume-builder", "ai-calendar", "task-master",
  "diary-lens", "portfolio-builder", "focus-flow", "mind-garden", "skill-tree",
  "booking-lite", "crm-pocket", "blog-forge", "attend-kit", "stock-keeper",
];

// デプロイ先の選択肢(すべてHuman Approval後のworkflow_dispatchで起動)
export const DEPLOY_TARGETS = [
  "Vercel",
  "Cloudflare Pages",
  "Netlify",
  "Firebase Hosting",
  "GitHub Pages",
  "Render",
  "Railway",
] as const;

// AI社員が開発中に自発的に出す改善提案の素材
export const IMPROVEMENT_POOL: {
  category: "UX" | "パフォーマンス" | "コード品質" | "技術負債" | "SEO" | "アクセシビリティ" | "CI";
  title: string;
  detail: string;
  role: StudioRole;
}[] = [
  { category: "UX", title: "空状態の導線改善", detail: "初回起動時にサンプルデータとチュートリアルを表示し、最初の操作までの離脱を減らす", role: "UX Designer" },
  { category: "UX", title: "操作のUndo対応", detail: "削除・完了操作に5秒間のUndoトーストを追加し、誤操作の不安を減らす", role: "UX Designer" },
  { category: "パフォーマンス", title: "初期バンドル削減", detail: "重い画面をdynamic importに分割し、初回表示のJSを30%削減する", role: "Frontend Engineer" },
  { category: "パフォーマンス", title: "N+1クエリ解消", detail: "一覧APIのリレーション取得をJOIN+選択カラム化し、応答を安定させる", role: "Database Engineer" },
  { category: "コード品質", title: "サービス層の共通エラー型", detail: "Result型を導入してエラーハンドリングを統一し、握りつぶしを防ぐ", role: "Reviewer" },
  { category: "技術負債", title: "重複ユーティリティの統合", detail: "日付整形が3箇所に重複しているため共通libへ集約する", role: "Reviewer" },
  { category: "SEO", title: "メタデータとOGP整備", detail: "generateMetadataでページ別title/description/OG画像を出力する", role: "Marketing" },
  { category: "アクセシビリティ", title: "フォーカス管理の改善", detail: "モーダルにフォーカストラップとEscクローズを実装し、キーボード操作を完結させる", role: "UI Designer" },
  { category: "CI", title: "PRごとのプレビュー環境", detail: "PRごとにプレビューデプロイを自動作成し、レビュー効率を上げる", role: "DevOps Engineer" },
  { category: "CI", title: "依存脆弱性の週次スキャン", detail: "Dependabot+npm auditをスケジュール実行し、脆弱性を早期検知する", role: "Security Engineer" },
];

// レビューAIパネル(Review工程で5観点のレビューを実施)
export const REVIEW_PANEL: {
  aspect: "コード品質" | "セキュリティ" | "パフォーマンス" | "アクセシビリティ" | "アーキテクチャ";
  role: StudioRole;
  findings: string[];
}[] = [
  { aspect: "コード品質", role: "Reviewer", findings: ["命名の一貫性: サービス層の動詞規約を統一(対応済み)", "重複ロジック1件を共通化(対応済み)"] },
  { aspect: "セキュリティ", role: "Security Engineer", findings: ["入力バリデーションをAPI境界で網羅(確認済み)", "認可チェックの抜け: なし"] },
  { aspect: "パフォーマンス", role: "DevOps Engineer", findings: ["一覧APIにページネーション実装(確認済み)", "画像はnext/imageで遅延読み込み"] },
  { aspect: "アクセシビリティ", role: "UI Designer", findings: ["コントラスト比AA準拠", "フォーム要素にラベル・エラー読み上げ対応(対応済み)"] },
  { aspect: "アーキテクチャ", role: "Architect", findings: ["サービス層/リポジトリ層の分離を確認", "将来のAPI差し替えポイントがインターフェース化されている"] },
];

// テストマトリクス(Testing工程で生成されるテスト計画)
export const TEST_MATRIX: { kind: string; tool: string; scope: string; count: number }[] = [
  { kind: "Unit", tool: "Vitest", scope: "サービス層・ユーティリティの正常系/境界値", count: 42 },
  { kind: "Integration", tool: "Vitest + Testing Library", scope: "APIルート×DBの結合", count: 12 },
  { kind: "E2E", tool: "Playwright", scope: "主要ユーザーフロー(登録→記録→振り返り)", count: 8 },
  { kind: "Accessibility", tool: "axe-core", scope: "全画面のWCAG 2.1 AA自動チェック", count: 6 },
  { kind: "Performance", tool: "Lighthouse CI", scope: "LCP/CLS/TBTの予算検証", count: 4 },
  { kind: "Regression", tool: "Playwright(スクリーンショット比較)", scope: "主要画面のビジュアル回帰", count: 6 },
];

// アプリカテゴリと、市場分析(競合・差別化・収益化)の素材。
// 公開情報を元にしたルールベースで、スクレイピングは行わない(将来API差し替え可能)。
export const PROPOSAL_CATEGORIES: {
  category: string;
  problems: string[];
  targets: string[];
  marketScale: string;
  competitors: { name: string; weakness: string }[];
  differentiation: string[];
  monetization: string[];
}[] = [
  { category: "家計簿", problems: ["支出の全体像が掴めない", "記録が三日坊主になる"], targets: ["一人暮らしの新社会人", "家計を見直したい夫婦"], marketScale: "国内PFM市場は数百万MAU規模で堅調", competitors: [{ name: "マネーフォワードME", weakness: "多機能ゆえに初心者に複雑" }, { name: "Zaim", weakness: "無料枠の制限が強い" }], differentiation: ["入力3秒のクイック記録", "AI週次サマリー"], monetization: ["Pro月額課金", "金融サービス送客"] },
  { category: "資格学習", problems: ["学習の継続が難しい", "進捗が見えず挫折する"], targets: ["資格取得を目指す社会人", "独学のエンジニア志望者"], marketScale: "リスキリング需要で学習アプリDLが年率2桁成長", competitors: [{ name: "Studyplus", weakness: "記録中心で出題機能が弱い" }, { name: "各資格の公式アプリ", weakness: "横断学習ができない" }], differentiation: ["ゲーミフィケーション", "試験日逆算プラン"], monetization: ["問題集アドオン課金", "月額サブスク"] },
  { category: "AI日記", problems: ["日々の記録が続かない", "振り返る習慣がない"], targets: ["日記を続けたい20代", "セルフケア関心層"], marketScale: "ジャーナリングアプリは北米中心に急成長中", competitors: [{ name: "Day One", weakness: "英語圏向けで日本語体験が弱い" }, { name: "muute", weakness: "分析の自由度が低い" }], differentiation: ["AIによる感情の振り返り", "3行で終わるUI"], monetization: ["プレミアム分析課金", "エクスポート課金"] },
  { category: "タスク管理", problems: ["タスクが多すぎて優先順位が付かない", "ツールが重い"], targets: ["マルチタスクのフリーランス", "小規模チーム"], marketScale: "生産性SaaSは世界で恒常的な需要", competitors: [{ name: "Todoist", weakness: "自然言語入力が日本語に弱い" }, { name: "Notion", weakness: "軽いタスク管理には過剰" }], differentiation: ["AIタスク自動分解", "1画面完結"], monetization: ["チーム課金", "Pro機能"] },
  { category: "筋トレ管理", problems: ["運動習慣が続かない", "成長が見えない"], targets: ["ジム初心者", "在宅トレーニー"], marketScale: "フィットネスアプリ課金率は上昇傾向", competitors: [{ name: "Strong", weakness: "日本語・RM計算のローカライズ不足" }], differentiation: ["RPG風レベルアップ", "部位別ヒートマップ"], monetization: ["プレミアムプラン", "トレーナー連携"] },
  { category: "旅行計画", problems: ["計画情報が分散する", "同行者と共有しづらい"], targets: ["グループ旅行の幹事", "個人旅行者"], marketScale: "旅行需要回復で計画系アプリの利用が増加", competitors: [{ name: "Wanderlog", weakness: "日本の交通事情に弱い" }], differentiation: ["日本の乗換・営業時間に最適化", "しおり自動生成"], monetization: ["アフィリエイト", "オフライン機能課金"] },
  { category: "献立管理", problems: ["毎日の献立を考えるのが苦痛", "食材を余らせる"], targets: ["共働き家庭", "自炊初心者"], marketScale: "料理系アプリは国内トップクラスの利用時間", competitors: [{ name: "クックパッド", weakness: "検索型で計画機能が弱い" }], differentiation: ["在庫から逆引き献立", "買い物リスト自動生成"], monetization: ["プレミアム献立", "ネットスーパー連携"] },
  { category: "GitHub分析", problems: ["自分の開発活動を客観視できない", "チームの活動が見えない"], targets: ["転職準備中のエンジニア", "EM/テックリード"], marketScale: "開発者ツールは高ARPUのニッチ市場", competitors: [{ name: "wakatime", weakness: "エディタ計測に限定" }], differentiation: ["GitHub APIだけで完結", "職務経歴書用サマリー出力"], monetization: ["個人Pro", "チームダッシュボード課金"] },
  { category: "ポートフォリオ", problems: ["ポートフォリオ作成に時間がかかる", "更新が続かない"], targets: ["転職準備中のエンジニア", "デザイナー"], marketScale: "採用市場の活況でポートフォリオ需要は安定", competitors: [{ name: "Notionポートフォリオ", weakness: "デザイン自由度と独自ドメイン対応が中途半端" }], differentiation: ["GitHub連携で自動更新", "1クリック公開"], monetization: ["独自ドメイン課金", "テンプレ販売"] },
  { category: "習慣管理", problems: ["習慣が続かない", "挫折すると再開できない"], targets: ["自己改善に関心のある20-30代"], marketScale: "習慣化アプリはストア上位常連", competitors: [{ name: "Habitica", weakness: "世界観が合わない層がいる" }, { name: "みんチャレ", weakness: "グループ強制が負担" }], differentiation: ["失敗を許容するストリーク設計", "AIコーチ"], monetization: ["月額サブスク", "ウィジェット課金"] },
  { category: "メモ", problems: ["メモが散らばり見つからない", "整理に時間がかかる"], targets: ["情報過多のナレッジワーカー"], marketScale: "ノートアプリは巨大市場だが乗り換え需要が常にある", competitors: [{ name: "Notion", weakness: "起動と同期が重い" }, { name: "Apple メモ", weakness: "構造化・検索が弱い" }], differentiation: ["ゼロ整理(AI自動タグ)", "ローカルファースト"], monetization: ["同期課金", "AI検索課金"] },
  { category: "PDF管理", problems: ["書類PDFが探せない", "スマホで注釈しづらい"], targets: ["士業・バックオフィス", "研究者"], marketScale: "文書管理はB2Bで確実な需要", competitors: [{ name: "Adobe Acrobat", weakness: "高価格・過剰機能" }], differentiation: ["OCR全文検索", "フォルダ自動仕分け"], monetization: ["容量課金", "チームプラン"] },
  { category: "予約管理", problems: ["電話予約の取りこぼし", "ダブルブッキング"], targets: ["個人サロン・教室運営者"], marketScale: "中小店舗のDX需要が拡大中", competitors: [{ name: "STORES予約", weakness: "手数料と月額が小規模には重い" }], differentiation: ["LINE連携リマインド", "無料から始められる料金設計"], monetization: ["月額プラン", "決済手数料"] },
  { category: "CRM", problems: ["顧客情報がスプレッドシートで限界", "商談の抜け漏れ"], targets: ["5人以下の営業チーム", "フリーランス"], marketScale: "SMB向けCRMは世界的成長市場", competitors: [{ name: "Salesforce", weakness: "小規模には高価で複雑" }, { name: "HubSpot", weakness: "日本語サポートが limited" }], differentiation: ["名刺写真から自動登録", "5分でセットアップ"], monetization: ["ユーザー数課金"] },
  { category: "ブログCMS", problems: ["技術ブログの執筆環境が重い", "デザイン調整に時間を取られる"], targets: ["技術発信するエンジニア", "個人クリエイター"], marketScale: "個人発信需要は継続、Markdownネイティブ層が拡大", competitors: [{ name: "WordPress", weakness: "保守・セキュリティ負担" }, { name: "note", weakness: "カスタマイズ不可・データ移行しづらい" }], differentiation: ["GitHubリポジトリがそのままCMS", "Markdown完全互換"], monetization: ["独自ドメイン課金", "テーマ販売"] },
  { category: "勤怠管理", problems: ["打刻漏れと集計作業が負担", "リモート勤務の実態が見えない"], targets: ["10-50人の中小企業"], marketScale: "労務DXは法改正のたびに需要増", competitors: [{ name: "KING OF TIME", weakness: "設定が複雑で導入負荷が高い" }], differentiation: ["Slack/LINE打刻", "給与ソフトCSV出力"], monetization: ["1人あたり月額課金"] },
  { category: "在庫管理", problems: ["棚卸しに時間がかかる", "欠品・過剰在庫が減らない"], targets: ["小規模EC事業者", "飲食店"], marketScale: "EC拡大で小規模事業者の在庫管理需要が増加", competitors: [{ name: "zaico", weakness: "ECモール連携が弱いプランがある" }], differentiation: ["バーコードスキャン", "発注点アラート"], monetization: ["品目数課金"] },
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
// Repository作成/Branch/Commit/Push/PR/Merge/Release/Deployの前には必ずHuman Approvalが入る。
export const STUDIO_PHASES: {
  id: StudioPhaseId;
  label: string;
  role: StudioRole | null;
  approval?: "repository" | "branch" | "commit" | "push" | "pullRequest" | "merge" | "release" | "deploy";
}[] = [
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
  { id: "approvalBranch", label: "Human Approval(Branch)", role: null, approval: "branch" },
  { id: "branchCreate", label: "Branch作成", role: "DevOps Engineer" },
  { id: "approvalCommit", label: "Human Approval(Commit)", role: null, approval: "commit" },
  { id: "commit", label: "Commit", role: "Frontend Engineer" },
  { id: "approvalPush", label: "Human Approval(Push)", role: null, approval: "push" },
  { id: "push", label: "Push", role: "DevOps Engineer" },
  { id: "approvalPr", label: "Human Approval(PR作成)", role: null, approval: "pullRequest" },
  { id: "pullRequest", label: "Pull Request", role: "Backend Engineer" },
  { id: "approvalMerge", label: "Human Approval(Merge)", role: null, approval: "merge" },
  { id: "merge", label: "Merge", role: "Reviewer" },
  { id: "actionsRun", label: "GitHub Actions", role: "DevOps Engineer" },
  { id: "approvalRelease", label: "Human Approval(Release)", role: null, approval: "release" },
  { id: "release", label: "Release", role: "Project Manager" },
  { id: "approvalDeploy", label: "Human Approval(Deploy)", role: null, approval: "deploy" },
  { id: "deploy", label: "Deploy", role: "DevOps Engineer" },
];

// Conventional Commitsのタイプ(AI社員のコミットメッセージ生成に使用)
export const COMMIT_TYPES = ["feat", "fix", "refactor", "docs", "test", "chore"] as const;

// Claude Codeへ送るプロンプトのテンプレート(工程→役割別)。
// そのままClaude Codeへ貼れば開発が始まる粒度(役割・成果物・受け入れ基準・制約)で書く。
export const CLAUDE_PROMPTS: Partial<Record<StudioPhaseId, { role: StudioRole; title: string; prompt: string }>> = {
  architecture: {
    role: "Architect",
    title: "システム設計",
    prompt: `あなたはシニアソフトウェアアーキテクトです。「{app}」({category}アプリ)のシステム設計を行ってください。

## 前提
- 技術スタック: {stack}
- 主要機能: {features}
- 方針: サービス層とリポジトリ層を分離し、外部API依存はアダプタで抽象化する

## 成果物
1. docs/architecture.md — レイヤー構成図(Mermaid)、主要モジュール一覧、データフロー、非機能要件(可用性/性能/セキュリティ)
2. src/ のフォルダ構造(空ファイルでよいので実際に作成)
3. .github/workflows/ci.yml — lint→typecheck→test→build→security scan→coverage→artifact

## 受け入れ基準
- tsc --noEmit / eslint がゼロエラーで通ること
- 各レイヤーの責務と依存方向がdocsに明記されていること`,
  },
  database: {
    role: "Database Engineer",
    title: "DBスキーマ実装",
    prompt: `あなたはデータベースエンジニアです。「{app}」のスキーマを実装してください。

## 前提
- DB: PostgreSQL(開発はSQLite可)。ORMはPrismaを使用
- 主要機能: {features}

## 成果物
1. prisma/schema.prisma — エンティティ・リレーション・インデックス(検索/集計クエリを想定)
2. docs/er-diagram.md — MermaidのER図と設計判断の理由
3. prisma/seed.ts — 動作確認用シード

## 受け入れ基準
- 全テーブルにcreated_at/updated_at、外部キーにonDelete方針を明記
- prisma migrate dev が成功すること`,
  },
  api: {
    role: "Backend Engineer",
    title: "認証+コアAPI実装",
    prompt: `あなたはバックエンドエンジニアです。「{app}」のAPIを実装してください。

## 前提
- スタック: {stack}
- 認証: セッションベース(Auth.js)。API境界でzodバリデーション

## 成果物
1. 認証API(サインアップ/ログイン/ログアウト/セッション取得)
2. コアリソースのCRUD API(サービス層+リポジトリパターンで分離)
3. docs/api-design.md — エンドポイント一覧(RFC 9457形式のエラー仕様含む)

## 受け入れ基準
- 認可チェック(自分のリソースのみ操作可)が全エンドポイントにあること
- 異常系(401/403/404/422)のテストがあること`,
  },
  uiDesign: {
    role: "UI Designer",
    title: "デザインシステム定義",
    prompt: `あなたはUIデザイナーです。「{app}」のデザインシステムを実装してください。

## 成果物
1. src/lib/tokens.ts — 色(ライト/ダーク)・タイポグラフィ・余白・角丸のトークン
2. docs/screen-design.md — 全画面のワイヤーフレーム(Mermaid/ASCII)と遷移図
3. 基本コンポーネント(Button/Card/Input/EmptyState)のTailwind実装

## 受け入れ基準
- コントラスト比WCAG 2.1 AA準拠
- モバイルファースト(375px基準)で全画面が崩れないこと`,
  },
  frontend: {
    role: "Frontend Engineer",
    title: "画面実装",
    prompt: `あなたはフロントエンドエンジニアです。「{app}」の画面を実装してください。

## 前提
- スタック: {stack}
- 主要機能: {features}
- デザイントークン(src/lib/tokens.ts)と画面設計(docs/screen-design.md)に従う

## 成果物
1. ホーム画面・メイン機能画面・設定画面
2. ローディング/エラー/空状態の3状態を全画面で実装
3. フォームはバリデーションエラーの即時表示付き

## 受け入れ基準
- Lighthouse Performance 90+/Accessibility 95+
- キーボードのみで全操作が完結すること`,
  },
  backend: {
    role: "Backend Engineer",
    title: "ドメインロジック実装",
    prompt: `あなたはバックエンドエンジニアです。「{app}」のコアドメインロジックを実装してください。

## 前提
- 機能: {features}
- サービス層({'src/services/'})に集約し、ルートハンドラは薄く保つ

## 成果物
1. 各機能のサービス層実装(集計・通知判定などのビジネスルール含む)
2. リポジトリ層(Prismaアクセスの抽象化)
3. 単体テスト(正常系+境界値)

## 受け入れ基準
- サービス層がHTTP/DBの詳細に依存しないこと
- カバレッジ80%以上`,
  },
  testing: {
    role: "QA Engineer",
    title: "テストスイート実装",
    prompt: `あなたはQAエンジニアです。「{app}」のテストスイートを実装してください。

## テストマトリクス
- Unit(Vitest): サービス層の正常系/境界値
- Integration(Vitest): APIルート×DB
- E2E(Playwright): 主要ユーザーフロー
- Accessibility(axe-core): 全画面のWCAG自動チェック
- Performance(Lighthouse CI): LCP/CLS予算
- Regression(Playwrightスクリーンショット比較): 主要画面

## 受け入れ基準
- カバレッジ80%以上、CIで全て実行されること
- flakyテストゼロ(リトライに依存しない)`,
  },
  review: {
    role: "Reviewer",
    title: "5観点レビュー",
    prompt: `あなたはレビューパネル(コード品質/セキュリティ/パフォーマンス/アクセシビリティ/アーキテクチャの5観点)です。「{app}」の変更をレビューしてください。

## 手順
1. 観点ごとに重大度(Critical/High/Medium/Low)付きで指摘
2. 各指摘に修正パッチを提示
3. docs/review-report.md へ結果をまとめる(観点別スコア0-100付き)

## ブロック条件
- Critical/Highが残っている場合はrequest_changesとし、マージ不可と明記すること`,
  },
  documentation: {
    role: "Technical Writer",
    title: "ドキュメント一式作成",
    prompt: `あなたはテクニカルライターです。「{app}」の公開品質ドキュメントを作成してください。

## 成果物
1. README.md — バッジ、概要、スクリーンショット枠、セットアップ、使い方、技術スタック、ライセンス
2. docs/roadmap.md — 3ヶ月ロードマップ
3. CHANGELOG.md(Keep a Changelog形式)/ docs/wiki.md(運用手順・FAQ)

## 受け入れ基準
- READMEだけで第三者が5分でローカル起動できること`,
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
