// アプリ企画の自動生成に使うジャンル別テンプレート。
// appIdeaGeneratorがここからランダムに組み合わせて企画書を作る。

export type AppIdeaTemplate = {
  genre: string;
  namePrefixes: string[];
  nameSuffixes: string[];
  targets: string[];
  problems: string[];
  solutions: string[];
  featurePool: string[];
  monetizations: string[];
  marketSize: 1 | 2 | 3 | 4 | 5;
  baseDifficulty: 1 | 2 | 3 | 4 | 5;
};

export const APP_IDEA_TEMPLATES: AppIdeaTemplate[] = [
  {
    genre: "資格学習アプリ",
    namePrefixes: ["Study", "Shikaku", "Manabi", "Passing"],
    nameSuffixes: ["Quest", "Camp", "Note", "Drill"],
    targets: ["資格取得を目指す社会人", "IT系資格に挑む学生"],
    problems: ["学習の継続が難しく、途中で挫折してしまう", "スキマ時間をうまく学習に使えていない"],
    solutions: ["1日5分のドリルと連続学習ストリークで習慣化を支援する", "通勤時間に最適化された一問一答で学習を積み上げる"],
    featurePool: ["一問一答ドリル", "学習ストリーク", "苦手分野分析", "模試モード", "学習リマインダー", "合格者の学習ログ閲覧"],
    monetizations: ["月額サブスクリプション", "問題集の追加課金"],
    marketSize: 4,
    baseDifficulty: 2,
  },
  {
    genre: "家計簿アプリ",
    namePrefixes: ["Kakei", "Money", "Zeni", "Osaifu"],
    nameSuffixes: ["Book", "Log", "Keeper", "Lens"],
    targets: ["一人暮らしの新社会人", "家計を見直したい夫婦"],
    problems: ["レシート入力が面倒で続かない", "何にいくら使ったか把握できていない"],
    solutions: ["3タップ入力と週次レポートで無理なく続けられるようにする", "固定費と変動費を自動で仕分けして見える化する"],
    featurePool: ["3タップ入力", "週次レポート", "予算アラート", "固定費の自動仕分け", "貯金目標トラッカー", "カテゴリ別グラフ"],
    monetizations: ["広告+プレミアムプラン", "買い切りPro版"],
    marketSize: 4,
    baseDifficulty: 2,
  },
  {
    genre: "筋トレ管理アプリ",
    namePrefixes: ["Muscle", "Kin", "Fit", "Train"],
    nameSuffixes: ["Log", "Dojo", "Partner", "Boost"],
    targets: ["ジム通いを始めたばかりの初心者", "自宅トレーニング派の会社員"],
    problems: ["正しいメニューの組み方が分からない", "成長が見えずモチベーションが続かない"],
    solutions: ["レベル別メニューの自動提案と重量の記録で成長を見える化する", "部位別のローテーションを自動で組んで迷いをなくす"],
    featurePool: ["部位別メニュー提案", "重量・回数の記録", "成長グラフ", "休息日リマインダー", "フォーム解説動画", "友達と競うランキング"],
    monetizations: ["月額サブスクリプション", "パーソナルプラン課金"],
    marketSize: 3,
    baseDifficulty: 2,
  },
  {
    genre: "タスク管理アプリ",
    namePrefixes: ["Task", "Todo", "Focus", "Flow"],
    nameSuffixes: ["Ninja", "Board", "Sprint", "Pilot"],
    targets: ["マルチタスクに追われる会社員", "副業を持つフリーランス"],
    problems: ["タスクが多すぎて優先順位が付けられない", "やりかけの作業が散らかって管理できない"],
    solutions: ["今日やる3件だけを選ばせるフォーカス設計で迷いを減らす", "プロジェクト別ボードと締切アラートで抜け漏れを防ぐ"],
    featurePool: ["今日の3タスク", "かんばんボード", "締切アラート", "ポモドーロタイマー", "週次ふりかえり", "カレンダー連携"],
    monetizations: ["フリーミアム+チームプラン", "買い切りPro版"],
    marketSize: 4,
    baseDifficulty: 3,
  },
  {
    genre: "日記アプリ",
    namePrefixes: ["Hibi", "Diary", "Kokoro", "Days"],
    nameSuffixes: ["Note", "Pages", "Memory", "Ink"],
    targets: ["日々を記録したい20代", "育児の記録を残したい親"],
    problems: ["書くことが思いつかず三日坊主になる", "過去の記録を見返す機会がない"],
    solutions: ["1日1問の質問に答えるだけで日記が完成する形式にする", "1年前の今日を自動で振り返るリマインドを届ける"],
    featurePool: ["1日1問形式", "写真添付", "1年前の今日", "気分タグ", "パスコードロック", "月間ハイライト自動生成"],
    monetizations: ["広告+プレミアムプラン", "月額サブスクリプション"],
    marketSize: 3,
    baseDifficulty: 1,
  },
  {
    genre: "レシピアプリ",
    namePrefixes: ["Recipe", "Gohan", "Cook", "Menu"],
    nameSuffixes: ["Box", "Today", "Compass", "Lab"],
    targets: ["毎日の献立に悩む共働き家庭", "自炊を始めたい一人暮らし"],
    problems: ["冷蔵庫の余り物をうまく使えない", "献立を考えること自体が負担になっている"],
    solutions: ["余り物食材から作れるレシピを逆引き検索できるようにする", "1週間の献立と買い物リストを自動で組み立てる"],
    featurePool: ["食材逆引き検索", "週間献立の自動作成", "買い物リスト", "15分レシピ特集", "栄養バランス表示", "お気に入りフォルダ"],
    monetizations: ["広告+プレミアムプラン", "食材宅配との連携手数料"],
    marketSize: 4,
    baseDifficulty: 3,
  },
  {
    genre: "旅行計画アプリ",
    namePrefixes: ["Tabi", "Trip", "Journey", "Sora"],
    nameSuffixes: ["Plan", "Map", "Note", "Compass"],
    targets: ["週末旅行が好きなカップル", "一人旅を楽しむ社会人"],
    problems: ["行程表づくりに時間がかかりすぎる", "行きたい場所のメモが散らばってしまう"],
    solutions: ["行きたい場所を放り込むだけで移動時間込みの行程表を組む", "地図・メモ・予約情報を1つの旅程にまとめる"],
    featurePool: ["行程表の自動作成", "地図ピン管理", "予約情報の一元化", "旅のしおり共有", "予算トラッカー", "オフライン閲覧"],
    monetizations: ["予約送客手数料", "プレミアムプラン"],
    marketSize: 3,
    baseDifficulty: 4,
  },
  {
    genre: "GitHub分析アプリ",
    namePrefixes: ["Commit", "Repo", "Kusa", "Dev"],
    nameSuffixes: ["Insight", "Garden", "Pulse", "Mirror"],
    targets: ["成長を可視化したい若手エンジニア", "転職準備中の開発者"],
    problems: ["自分の開発活動の傾向を客観視できない", "ポートフォリオに使える実績データがまとまらない"],
    solutions: ["コミット傾向や言語比率を自動分析してレポート化する", "活動データを1枚のシェア用カードに変換する"],
    featurePool: ["コミット傾向分析", "言語比率グラフ", "実績シェアカード", "週次成長レポート", "リポジトリ健康診断", "目標コミット設定"],
    monetizations: ["フリーミアム+Pro分析", "買い切りPro版"],
    marketSize: 2,
    baseDifficulty: 3,
  },
  {
    genre: "ポートフォリオ作成アプリ",
    namePrefixes: ["Port", "Craft", "Show", "Career"],
    nameSuffixes: ["Folio", "Deck", "Case", "Stage"],
    targets: ["就活中のデザイン系学生", "案件を獲りたいフリーランス"],
    problems: ["ポートフォリオづくりに何日もかかってしまう", "実績をきれいに見せるデザインスキルがない"],
    solutions: ["テンプレートに沿って入力するだけで公開ページが完成する", "実績カードを並べ替えるだけのブロック型エディタを提供する"],
    featurePool: ["テンプレート選択", "ブロック型エディタ", "独自URL公開", "閲覧アクセス解析", "PDF書き出し", "SNSプロフィール連携"],
    monetizations: ["フリーミアム+独自ドメイン課金", "月額サブスクリプション"],
    marketSize: 2,
    baseDifficulty: 3,
  },
  {
    genre: "メンタルケアアプリ",
    namePrefixes: ["Cocoro", "Yasuragi", "Mind", "Sukima"],
    nameSuffixes: ["Care", "Breath", "Garden", "Tune"],
    targets: ["仕事のストレスを抱える20〜30代", "睡眠の質を上げたい社会人"],
    problems: ["ストレスに気づいた時には溜まりすぎている", "リラックスする習慣がなく寝つきが悪い"],
    solutions: ["1日1回の気分チェックで不調の兆しを早めに捉える", "3分の呼吸ガイドと環境音で就寝前の習慣をつくる"],
    featurePool: ["気分チェック", "呼吸ガイド", "環境音プレイヤー", "セルフケア日記", "ストレス傾向レポート", "睡眠リズム記録"],
    monetizations: ["月額サブスクリプション", "法人向け福利厚生プラン"],
    marketSize: 3,
    baseDifficulty: 2,
  },
];
