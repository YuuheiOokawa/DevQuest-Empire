import type { StudioEmployee } from "@/services/aiStudioTypes";

// AI開発スタジオの社員20人。役割・責務・専門技術・性格・思考を持つ。
const E = (
  id: string,
  name: string,
  role: StudioEmployee["role"],
  duty: string,
  expertise: string[],
  personality: string,
  thinking: string,
  favLanguage: string,
  weakLanguage: string,
  quality: number,
  speed: number
): StudioEmployee => ({
  id, name, role, duty, expertise, exp: 0, personality, thinking,
  favLanguage, weakLanguage, quality, speed,
});

export const STUDIO_EMPLOYEES: StudioEmployee[] = [
  E("st-yui", "ユイ", "CEO Assistant", "CEOの意思決定を補佐し承認事項を整理する", ["経営企画", "議事進行"], "気配り上手", "全体最適で考える", "TypeScript", "Rust", 78, 72),
  E("st-mirai", "ミライ", "Product Manager", "プロダクトの価値定義と優先順位付け", ["企画", "KPI設計", "ユーザーリサーチ"], "アイデアマン", "課題起点で考える", "TypeScript", "Go", 80, 68),
  E("st-itsuki", "イツキ", "Project Manager", "スケジュールとリスクの管理", ["WBS", "アジャイル"], "冷静沈着", "逆算で考える", "TypeScript", "Rust", 74, 76),
  E("st-takumi", "タクミ", "Architect", "システム全体の設計と技術選定", ["分散システム", "DDD", "クラウド設計"], "職人気質", "トレードオフで考える", "Go", "Ruby", 90, 60),
  E("st-ren", "レン", "Frontend Engineer", "UI実装とフロント品質", ["React", "Next.js", "アニメーション"], "楽観的", "ユーザー体験から考える", "TypeScript", "Java", 76, 82),
  E("st-tsumugi", "ツムギ", "Backend Engineer", "API/ドメインロジック実装", ["Node.js", "NestJS", "PostgreSQL"], "堅実", "データ整合性から考える", "TypeScript", "Swift", 84, 70),
  E("st-sora", "ソラ", "Mobile Engineer", "モバイルアプリ実装", ["Flutter", "React Native"], "フットワーク軽め", "端末差から考える", "Dart", "PHP", 75, 78),
  E("st-noa", "ノア", "AI Engineer", "AI機能とプロンプト設計", ["OpenAI", "Claude Code", "RAG"], "天才肌", "データで考える", "Python", "Ruby", 88, 74),
  E("st-kaede", "カエデ", "Database Engineer", "スキーマ設計とクエリ最適化", ["PostgreSQL", "Supabase", "インデックス設計"], "几帳面", "正規化から考える", "SQL", "Swift", 86, 62),
  E("st-hayate", "ハヤテ", "DevOps Engineer", "CI/CDとインフラ自動化", ["GitHub Actions", "Docker", "Terraform"], "自動化厨", "再現性で考える", "Go", "Java", 82, 80),
  E("st-kakeru", "カケル", "QA Engineer", "テスト計画と品質保証", ["E2Eテスト", "境界値分析"], "慎重派", "壊れ方から考える", "TypeScript", "Rust", 80, 66),
  E("st-shion", "シオン", "Security Engineer", "脆弱性診断とセキュア設計", ["OWASP", "認証認可", "SAST"], "疑い深い", "攻撃者視点で考える", "Go", "Dart", 87, 58),
  E("st-aoi", "アオイ", "UI Designer", "ビジュアルデザインとデザインシステム", ["Figma", "デザイントークン"], "完璧主義", "ピクセルで考える", "TypeScript", "Java", 83, 64),
  E("st-hina", "ヒナ", "UX Designer", "体験設計とユーザビリティ検証", ["ユーザーテスト", "IA設計"], "共感型", "ユーザーの気持ちで考える", "TypeScript", "Go", 79, 68),
  E("st-rei", "レイ", "Reviewer", "コードレビューと品質基準の維持", ["静的解析", "リファクタリング"], "辛口", "保守性で考える", "TypeScript", "PHP", 92, 55),
  E("st-fumi", "フミ", "Technical Writer", "ドキュメントとリリースノート作成", ["テクニカルライティング", "API文書"], "丁寧", "読み手で考える", "Markdown", "Rust", 81, 70),
  E("st-hikari", "ヒカリ", "Marketing", "市場調査とグロース施策", ["ASO", "SNS分析"], "ムードメーカー", "トレンドで考える", "Python", "Java", 72, 84),
  E("st-daichi", "ダイチ", "Sales", "収益化と提携の推進", ["価格設計", "B2B提案"], "押しが強い", "収益で考える", "TypeScript", "Rust", 70, 80),
  E("st-nagi", "ナギ", "Customer Support", "ユーザーの声の収集と改善提案", ["FAQ設計", "VoC分析"], "聞き上手", "困りごとから考える", "TypeScript", "Go", 73, 75),
  E("st-mio", "ミオ", "Data Analyst", "利用データ分析と意思決定支援", ["SQL", "ダッシュボード設計"], "数字の鬼", "仮説検証で考える", "SQL", "Swift", 85, 67),
];
