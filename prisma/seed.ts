import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// マスタデータ定義の根拠: 18_Phase3_Detailed_Design.md Part2 / Part3

// 各建物はmetric(ActivityMetricsのキー)とthresholds(レベルごとの閾値、
// 配列の長さ=最大レベル)で成長する。根拠: 18_Phase3 Part2をPhase5で拡張。
const buildingMasters = [
  {
    type: "house_small",
    name: "家",
    description: "コミットの積み重ねで発展する住居。",
    metric: "commitCount",
    thresholds: [1, 5, 15, 30, 50],
    sortOrder: 0,
  },
  {
    type: "house_large",
    name: "大きな家",
    description: "長期的なコミット継続の証となる邸宅。",
    metric: "commitCount",
    thresholds: [50, 100, 200, 400, 800],
    sortOrder: 1,
  },
  {
    type: "blacksmith",
    name: "鍛冶屋",
    description: "Issue解決の腕が認められた者が集う工房。",
    metric: "issueCloseCount",
    thresholds: [5, 10, 20, 40, 80],
    sortOrder: 2,
  },
  {
    type: "guild",
    name: "ギルド",
    description: "多くの課題を解決してきた開発者が集う場所。",
    metric: "issueCloseCount",
    thresholds: [20, 40, 80, 150, 300],
    sortOrder: 3,
  },
  {
    type: "tavern",
    name: "酒場",
    description: "提案(Pull Request)が飛び交う社交場。",
    metric: "prOpenCount",
    thresholds: [5, 10, 20, 40, 80],
    sortOrder: 4,
  },
  {
    type: "dev_base",
    name: "開発拠点",
    description: "マージされた成果が積み上がる開発の中心地。",
    metric: "prMergeCount",
    thresholds: [10, 20, 40, 80, 150],
    sortOrder: 5,
  },
  {
    type: "castle",
    name: "城",
    description: "プレイヤーの総合的な成長を象徴する城。",
    metric: "level",
    thresholds: [10, 20, 30, 50, 100],
    sortOrder: 6,
  },
  {
    type: "library",
    name: "図書館",
    description: "学習時間の積み重ねで発展する知識の殿堂。",
    metric: "studyMinutesTotal",
    thresholds: [60, 300, 600, 1200, 3000],
    sortOrder: 7,
  },
  {
    type: "academy",
    name: "アカデミー",
    description: "資格取得の実績で発展する教育機関。",
    metric: "qualificationsPassedCount",
    thresholds: [1, 2, 3, 5, 8],
    sortOrder: 8,
  },
  {
    type: "monument",
    name: "記念碑",
    description: "ミッション達成の積み重ねを称える記念碑。",
    metric: "missionsClaimedTotal",
    thresholds: [5, 15, 30, 60, 100],
    sortOrder: 9,
  },
];

const fallbackQuests = [
  { title: "READMEを見直す", description: "自分のリポジトリのREADMEを読み返し、誤字や古い情報を1つ直してみましょう。", difficulty: "easy" },
  { title: "小さなリファクタリング", description: "気になっていた関数や変数名を1つ、わかりやすい名前に変更してみましょう。", difficulty: "easy" },
  { title: "テストを1つ追加する", description: "既存の関数に対して、まだ無いテストケースを1つ書いてみましょう。", difficulty: "medium" },
  { title: "Issueを1件起票する", description: "気になっているバグや改善点をIssueとして書き出してみましょう。", difficulty: "easy" },
  { title: "ドキュメントを書く", description: "実装した機能について、簡単な説明をコメントかドキュメントに残しましょう。", difficulty: "easy" },
  { title: "依存パッケージを確認する", description: "package.jsonの依存関係に古いものがないか確認してみましょう。", difficulty: "medium" },
  { title: "小さなバグを1つ直す", description: "放置していた小さな不具合を1つ選んで修正してみましょう。", difficulty: "medium" },
  { title: "直近のコミットを見返す", description: "自分の直近のコミットを見直し、改善できる点を探してみましょう。", difficulty: "easy" },
  { title: "新しいライブラリを調べる", description: "興味のあるライブラリのドキュメントを15分読んでみましょう。", difficulty: "easy" },
  { title: "エラーハンドリングを見直す", description: "1つの関数のエラーハンドリングを見直し、改善してみましょう。", difficulty: "hard" },
];

const achievementMasters = [
  {
    type: "first_sync",
    name: "はじめの一歩",
    condition: "初回のGitHub同期を完了する",
  },
  {
    type: "streak_7",
    name: "習慣化",
    condition: "最長連続活動日数が7日以上になる",
  },
  {
    type: "commit_100",
    name: "百の頂",
    condition: "累計コミット数が100件以上になる",
  },
  {
    type: "pr_merge_10",
    name: "マージ職人",
    condition: "累計Pull Requestマージ数が10件以上になる",
  },
  {
    type: "quest_30",
    name: "継続は力なり",
    condition: "完了済みクエスト数が30件以上になる",
  },
];

const titleMasters = [
  {
    type: "novice",
    name: "駆け出し冒険者",
    condition: "はじめから装着できる称号",
    unlockCondition: { metric: "level", operator: ">=", value: 1 },
  },
  {
    type: "apprentice",
    name: "見習い開発者",
    condition: "プレイヤーレベル5に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 5 },
  },
  {
    type: "journeyman",
    name: "一人前の開発者",
    condition: "プレイヤーレベル10に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 10 },
  },
  {
    type: "veteran",
    name: "熟練エンジニア",
    condition: "プレイヤーレベル20に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 20 },
  },
  {
    type: "legend",
    name: "伝説の開発者",
    condition: "プレイヤーレベル30に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 30 },
  },
];

const missionMasters = [
  {
    type: "daily_commit_2",
    name: "今日はコミットを2回",
    description: "今日中に2回コミットしましょう。",
    period: "daily",
    metric: "commitCount",
    targetValue: 2,
    expReward: 15,
  },
  {
    type: "daily_issue_close_1",
    name: "今日はIssueを1件クローズ",
    description: "今日中にIssueを1件クローズしましょう。",
    period: "daily",
    metric: "issueCloseCount",
    targetValue: 1,
    expReward: 20,
  },
  {
    type: "daily_pr_open_1",
    name: "今日はPRを1件作成",
    description: "今日中にPull Requestを1件作成しましょう。",
    period: "daily",
    metric: "prOpenCount",
    targetValue: 1,
    expReward: 15,
  },
  {
    type: "weekly_commit_10",
    name: "今週はコミットを10回",
    description: "今週中に合計10回コミットしましょう。",
    period: "weekly",
    metric: "commitCount",
    targetValue: 10,
    expReward: 50,
  },
  {
    type: "weekly_pr_merge_3",
    name: "今週はPRを3件マージ",
    description: "今週中にPull Requestを3件マージしましょう。",
    period: "weekly",
    metric: "prMergeCount",
    targetValue: 3,
    expReward: 80,
  },
  {
    type: "weekly_issue_close_3",
    name: "今週はIssueを3件クローズ",
    description: "今週中にIssueを3件クローズしましょう。",
    period: "weekly",
    metric: "issueCloseCount",
    targetValue: 3,
    expReward: 60,
  },
];

const qualificationMasters = [
  { type: "java_silver", name: "Java Silver (Oracle Certified Java Programmer, Silver)", category: "Java" },
  { type: "java_gold", name: "Java Gold (Oracle Certified Java Programmer, Gold)", category: "Java" },
  { type: "fe", name: "基本情報技術者試験", category: "情報処理" },
  { type: "ap", name: "応用情報技術者試験", category: "情報処理" },
  { type: "aws_clf", name: "AWS Certified Cloud Practitioner", category: "AWS" },
  { type: "aws_saa", name: "AWS Certified Solutions Architect - Associate", category: "AWS" },
  { type: "lpic1", name: "LPIC-1", category: "Linux" },
  { type: "gcp_ace", name: "Google Cloud Associate Cloud Engineer", category: "GCP" },
];

async function main() {
  for (const b of buildingMasters) {
    await prisma.buildingMaster.upsert({
      where: { type: b.type },
      update: b,
      create: b,
    });
  }

  for (const a of achievementMasters) {
    await prisma.achievementMaster.upsert({
      where: { type: a.type },
      update: a,
      create: a,
    });
  }

  for (const t of titleMasters) {
    await prisma.titleMaster.upsert({
      where: { type: t.type },
      update: t,
      create: t,
    });
  }

  for (const m of missionMasters) {
    await prisma.missionMaster.upsert({
      where: { type: m.type },
      update: m,
      create: m,
    });
  }

  for (const q of qualificationMasters) {
    await prisma.qualificationMaster.upsert({
      where: { type: q.type },
      update: q,
      create: q,
    });
  }

  // FallbackQuestはユニークキーを持たないため、毎回全消し→再投入する
  await prisma.fallbackQuest.deleteMany();
  await prisma.fallbackQuest.createMany({ data: fallbackQuests });

  console.log(
    `Seed完了: BuildingMaster ${buildingMasters.length}件 / AchievementMaster ${achievementMasters.length}件 / TitleMaster ${titleMasters.length}件 / MissionMaster ${missionMasters.length}件 / QualificationMaster ${qualificationMasters.length}件 / FallbackQuest ${fallbackQuests.length}件`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
