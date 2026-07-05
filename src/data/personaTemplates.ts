import type { EmployeeRole, MeetingCategory, PhaseId, Rarity } from "@/services/aiCompanyTypes";

// AI社員の人格・会話・会議・レビューのテンプレート集。
// すべてルールベース生成の素材で、将来AI APIに置き換える場合は
// これらを参照している各サービスの生成関数だけ差し替えれば良い。

export const NAME_POOL = [
  "ソラ", "リク", "ハナ", "ユズ", "カイ", "セナ", "トワ", "ニコ",
  "ラン", "シオン", "アキラ", "コハク", "ミオ", "ハルト", "スミレ",
  "ケイ", "ナギ", "フウカ", "イツキ", "レイ",
];

export const PERSONALITY_POOL = [
  "完璧主義", "楽観的", "慎重派", "職人気質", "アイデアマン",
  "ムードメーカー", "寡黙な実力者", "負けず嫌い", "コツコツ型", "天才肌",
];

export const TECH_POOL = [
  "React", "Next.js", "Vue", "Spring", "Java", "Go", "Rust", "Python",
  "TypeScript", "AWS", "Docker", "Kubernetes", "Claude Code", "OpenAI",
  "GitHub Actions", "Terraform", "GraphQL", "PostgreSQL", "Redis", "Figma",
];

export const LANGUAGE_POOL = ["TypeScript", "Java", "Go", "Rust", "Python", "Ruby", "Kotlin", "Swift"];

export const SPECIALTY_BY_ROLE: Record<EmployeeRole, string[]> = {
  "プロダクトマネージャー": ["ユーザー課題の発見", "ロードマップ設計", "KPI設計"],
  "UI/UXデザイナー": ["モバイルUI", "デザインシステム", "マイクロインタラクション"],
  "フロントエンドエンジニア": ["アニメーション実装", "状態管理", "パフォーマンス改善"],
  "バックエンドエンジニア": ["DB設計", "API設計", "負荷対策"],
  "AIエンジニア": ["レコメンド機能", "自動生成パイプライン", "プロンプト設計"],
  "QAエンジニア": ["境界値テスト", "自動E2Eテスト", "探索的テスト"],
  "マーケター": ["SNSバズ設計", "ASO対策", "グロースハック"],
};

// ガチャのレアリティ排出率(%)と能力補正
export const GACHA_RATES: { rarity: Rarity; rate: number; statMin: number; statMax: number; salaryBase: number }[] = [
  { rarity: "N", rate: 34, statMin: 30, statMax: 55, salaryBase: 300 },
  { rarity: "R", rate: 28, statMin: 40, statMax: 65, salaryBase: 400 },
  { rarity: "SR", rate: 10, statMin: 50, statMax: 75, salaryBase: 550 },
  { rarity: "SSR", rate: 12, statMin: 60, statMax: 85, salaryBase: 700 },
  { rarity: "UR", rate: 8, statMin: 68, statMax: 90, salaryBase: 900 },
  { rarity: "LR", rate: 5, statMin: 75, statMax: 94, salaryBase: 1100 },
  { rarity: "神話", rate: 2, statMin: 82, statMax: 97, salaryBase: 1400 },
  { rarity: "伝説", rate: 1, statMin: 88, statMax: 100, salaryBase: 1800 },
];

// 工程ごとの社員会話テンプレート({name}は話者以外の置換なし・素の台詞)
export const TALK_TEMPLATES: Partial<Record<PhaseId, { role: EmployeeRole; line: string }[][]>> = {
  planning: [
    [
      { role: "プロダクトマネージャー", line: "ターゲットの課題を3つに絞り込みました。" },
      { role: "マーケター", line: "競合アプリのレビューも分析しておきますね。" },
    ],
    [
      { role: "プロダクトマネージャー", line: "このアイデア、刺さる層が明確ですね。" },
      { role: "UI/UXデザイナー", line: "初回体験のイメージ、先にラフを描いてみます。" },
    ],
  ],
  requirements: [
    [
      { role: "プロダクトマネージャー", line: "仕様変更が入りました。優先度を整理します。" },
      { role: "フロントエンドエンジニア", line: "了解です。デザインを少し修正します。" },
      { role: "バックエンドエンジニア", line: "こちらはAPI変更で対応します。" },
    ],
    [
      { role: "プロダクトマネージャー", line: "MVPの範囲、この3機能で確定にしましょう。" },
      { role: "QAエンジニア", line: "受け入れ条件も一緒に書いておきます。" },
    ],
  ],
  screenDesign: [
    [
      { role: "UI/UXデザイナー", line: "画面遷移図できました。5画面に収まっています。" },
      { role: "プロダクトマネージャー", line: "オンボーディングは1画面減らせそうですね。" },
    ],
  ],
  erDiagram: [
    [
      { role: "バックエンドエンジニア", line: "ER図を更新しました。中間テーブルを1つ追加です。" },
      { role: "AIエンジニア", line: "レコメンド用のログテーブルもここに足しましょう。" },
    ],
  ],
  apiDesign: [
    [
      { role: "バックエンドエンジニア", line: "エンドポイントは12本。RESTで揃えました。" },
      { role: "フロントエンドエンジニア", line: "レスポンスの型定義、共有お願いします。" },
    ],
  ],
  authDesign: [
    [
      { role: "バックエンドエンジニア", line: "認証はOAuth+セッション方式でいきます。" },
      { role: "QAエンジニア", line: "権限まわりのテストケースを先に作っておきます。" },
    ],
  ],
  dbDesign: [
    [
      { role: "バックエンドエンジニア", line: "インデックス設計まで終わりました。" },
      { role: "AIエンジニア", line: "集計クエリはマテビューにすると速そうです。" },
    ],
  ],
  uiImpl: [
    [
      { role: "フロントエンドエンジニア", line: "ホーム画面のコンポーネント分割が終わりました。" },
      { role: "UI/UXデザイナー", line: "余白が詰まりすぎです。8px単位に揃えてください。" },
    ],
    [
      { role: "フロントエンドエンジニア", line: "アニメーション入れたらぐっと良くなりました。" },
      { role: "QAエンジニア", line: "この機能、端末によってはバグがありますね…確認します。" },
    ],
  ],
  apiImpl: [
    [
      { role: "バックエンドエンジニア", line: "コアAPIの実装完了。テスト書きながら進めてます。" },
      { role: "AIエンジニア", line: "自動生成コードを改善しました。速度が2倍です。" },
    ],
  ],
  review: [
    [
      { role: "AIエンジニア", line: "PRレビューしました。設計は良いと思います。" },
      { role: "フロントエンドエンジニア", line: "指摘の命名、直しておきます。" },
    ],
  ],
  ci: [
    [
      { role: "QAエンジニア", line: "CIパイプラインが通りました。自動テスト付きです。" },
      { role: "バックエンドエンジニア", line: "これでデグレをすぐ検知できますね。" },
    ],
  ],
  testing: [
    [
      { role: "QAエンジニア", line: "回帰テスト実施中。この機能、バグがあります。" },
      { role: "フロントエンドエンジニア", line: "再現できました。今日中に直します。" },
    ],
  ],
  bugfix: [
    [
      { role: "QAエンジニア", line: "残バグは残り2件。優先度高から潰しましょう。" },
      { role: "バックエンドエンジニア", line: "境界値のやつは修正済みです。" },
    ],
  ],
  beta: [
    [
      { role: "マーケター", line: "β版の先行ユーザー、100人集まりました!" },
      { role: "プロダクトマネージャー", line: "フィードバックフォームも設置済みです。" },
    ],
  ],
  release: [
    [
      { role: "マーケター", line: "ストア掲載文とスクショ、準備完了です。" },
      { role: "プロダクトマネージャー", line: "リリースチェックリスト、全部グリーンです!" },
    ],
  ],
  operation: [
    [
      { role: "マーケター", line: "初週のリテンション、想定より良いですね。" },
      { role: "AIエンジニア", line: "レコメンドのCTRも上がってきています。" },
    ],
  ],
  update: [
    [
      { role: "プロダクトマネージャー", line: "アップデートで要望トップ3を入れましょう。" },
      { role: "フロントエンドエンジニア", line: "ダークモード対応、ついにやりますか!" },
    ],
  ],
};

// 汎用の雑談(工程テンプレが無い時のフォールバック)
export const GENERIC_TALKS: { role: EmployeeRole; line: string }[][] = [
  [
    { role: "フロントエンドエンジニア", line: "やっぱり{likes}は書きやすいですね。" },
    { role: "バックエンドエンジニア", line: "私は{likes}派です。譲れません。" },
  ],
  [
    { role: "QAエンジニア", line: "テストが全部緑だと気持ちいいですね。" },
    { role: "マーケター", line: "その調子でレビュー星5も緑にしましょう(?)" },
  ],
];

// AI会議のトピックと発言テンプレート
export const MEETING_TOPICS: Record<MeetingCategory, { topic: string; opinions: string[]; conclusions: string[] }[]> = {
  企画: [
    {
      topic: "次のアプリの方向性",
      opinions: [
        "もっと初心者向けに振り切った方が良いと思います",
        "ニッチでも刺さる層を狙うべきです",
        "既存アプリとの連携機能が欲しいですね",
        "課金導線は最初から設計しておきましょう",
      ],
      conclusions: ["ターゲットを初心者に絞る方針で合意", "次回スプリントで企画案を3本出すことに決定"],
    },
    {
      topic: "ユーザーヒアリングの結果共有",
      opinions: [
        "オンボーディングで離脱が多いようです",
        "通知の頻度が多すぎるという声がありました",
        "料金より使いやすさを重視する層が多いです",
      ],
      conclusions: ["オンボーディングを2画面に短縮する", "通知設定をユーザーに委ねる方針に変更"],
    },
  ],
  設計: [
    {
      topic: "技術選定の見直し",
      opinions: [
        "ReactよりVueの方が学習コストは低いですが、採用市場はReactが有利です",
        "型安全性を考えるとTypeScriptは必須です",
        "インフラはマネージドに寄せて運用コストを下げましょう",
        "認証は自前実装をやめて標準ライブラリに任せるべきです",
      ],
      conclusions: ["現行スタックを維持しつつ段階的に改善", "認証はライブラリ採用で工数を削減"],
    },
    {
      topic: "画面数の最適化",
      opinions: [
        "画面数を減らそう。5画面あれば足ります",
        "設定画面は1つに統合できます",
        "モーダルの多用は避けたいです",
      ],
      conclusions: ["主要フローを5画面に集約することで合意"],
    },
  ],
  レビュー: [
    {
      topic: "コードレビュー運用の改善",
      opinions: [
        "レビューの観点リストを作って属人化を防ぎましょう",
        "PRは小さく分割した方がレビューが速いです",
        "自動レビューで機械的な指摘は減らせます",
      ],
      conclusions: ["PRの推奨サイズを300行以下に設定", "レビュー観点チェックリストを導入"],
    },
  ],
  改善: [
    {
      topic: "アプリ改善のアイデア出し",
      opinions: [
        "広告位置を変更しよう。下部固定は誤タップが多いです",
        "起動時間をあと1秒縮めたいです",
        "ウィジェット対応の要望が増えています",
        "アクセシビリティ対応も進めましょう",
      ],
      conclusions: ["広告位置をコンテンツ間に移動する", "次回アップデートで起動高速化を実施"],
    },
  ],
  売上分析: [
    {
      topic: "今月の売上レビュー",
      opinions: [
        "課金転換率は横ばいですが、継続率が改善しています",
        "レビュー評価と売上の相関がはっきり出ています",
        "広告収益よりサブスクを伸ばす方が健全です",
        "バグ修正後に解約率が下がりました",
      ],
      conclusions: ["品質改善が売上に直結すると確認。QA工数を増やす", "サブスク導線のABテストを開始する"],
    },
  ],
};

// AIレビューコメント(verdictがrequest_changesの時に使う)
export const REVIEW_COMMENTS = [
  "命名規則が統一されていません。camelCaseに揃えてください",
  "この関数は責務が大きすぎます。分割を検討してください",
  "テストを書いてください。カバレッジが下がっています",
  "このSQLはN+1になっています。JOINで最適化できます",
  "マジックナンバーは定数に切り出しましょう",
  "エラーハンドリングが握りつぶされています",
  "重複コードがあります。共通化しましょう",
  "この型はanyになっています。明示的な型を付けてください",
];

export const REVIEW_APPROVES = [
  "LGTMです!設計がきれいですね",
  "読みやすいコードです。承認します",
  "テストも揃っていて良いPRです",
  "パフォーマンスへの配慮が素晴らしいです",
];

// GitHubシミュレーション用: 職種ごとのファイル名プール
export const FILES_BY_ROLE: Partial<Record<EmployeeRole, string[]>> = {
  "フロントエンドエンジニア": [
    "Home.tsx", "AppShell.tsx", "SettingsPage.tsx", "useAppData.ts", "ThemeProvider.tsx",
    "OnboardingFlow.tsx", "ListItem.tsx", "ChartView.tsx",
  ],
  "バックエンドエンジニア": [
    "userService.ts", "authController.ts", "schema.prisma", "apiRouter.ts", "billingService.ts",
    "notificationJob.ts", "migration_001.sql", "cacheLayer.ts",
  ],
  "AIエンジニア": [
    "recommend.py", "pipeline.ts", "embedding.ts", "promptBuilder.ts", "modelClient.ts",
  ],
  "QAエンジニア": [
    "home.spec.ts", "auth.e2e.ts", "api.test.ts", "fixtures.ts", "ci.yml",
  ],
  "UI/UXデザイナー": ["tokens.css", "theme.ts", "icons.tsx", "design-system.md"],
  "プロダクトマネージャー": ["README.md", "CHANGELOG.md", "docs/spec.md"],
  "マーケター": ["store-listing.md", "analytics.ts", "campaign.md"],
};

export const COMMIT_VERBS = ["add", "fix", "refactor", "improve", "update", "polish", "optimize"];
export const COMMIT_TARGETS = [
  "ログイン画面", "一覧表示", "設定同期", "通知処理", "キャッシュ層", "入力バリデーション",
  "オンボーディング", "課金フロー", "検索機能", "グラフ描画", "エラー表示", "パフォーマンス",
];
