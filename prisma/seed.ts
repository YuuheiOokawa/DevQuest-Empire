import "dotenv/config";
import { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

// マスタデータ定義の根拠: 18_Phase3_Detailed_Design.md Part2 / Part3

// 各建物はmetric(ActivityMetricsのキー)とthresholds(レベルごとの閾値、
// 配列の長さ=最大レベル)で成長する。根拠: 18_Phase3 Part2をPhase5で拡張。
// requiredTierは村の発展段階(1:村 2:町 3:大きな町 4:帝国 5:王国 6:国)。
// 現在の発展段階以下の建物のみが村画面に出現する(lib/game/settlement.ts参照)。
const buildingMasters = [
  // --- Tier1: 村 ---
  {
    type: "house_small",
    name: "家",
    description: "コミットの積み重ねで発展する住居。",
    metric: "commitCount",
    thresholds: [1, 5, 15, 30, 50],
    requiredTier: 1,
    sortOrder: 0,
  },
  {
    type: "house_large",
    name: "大きな家",
    description: "長期的なコミット継続の証となる邸宅。",
    metric: "commitCount",
    thresholds: [50, 100, 200, 400, 800],
    requiredTier: 1,
    sortOrder: 1,
  },
  {
    type: "blacksmith",
    name: "鍛冶屋",
    description: "Issue解決の腕が認められた者が集う工房。",
    metric: "issueCloseCount",
    thresholds: [5, 10, 20, 40, 80],
    requiredTier: 1,
    sortOrder: 2,
  },
  {
    type: "guild",
    name: "ギルド",
    description: "多くの課題を解決してきた開発者が集う場所。",
    metric: "issueCloseCount",
    thresholds: [20, 40, 80, 150, 300],
    requiredTier: 1,
    sortOrder: 3,
  },
  {
    type: "tavern",
    name: "酒場",
    description: "提案(Pull Request)が飛び交う社交場。",
    metric: "prOpenCount",
    thresholds: [5, 10, 20, 40, 80],
    requiredTier: 1,
    sortOrder: 4,
  },
  {
    type: "dev_base",
    name: "開発拠点",
    description: "マージされた成果が積み上がる開発の中心地。",
    metric: "prMergeCount",
    thresholds: [10, 20, 40, 80, 150],
    requiredTier: 1,
    sortOrder: 5,
  },
  {
    type: "castle",
    name: "城",
    description: "プレイヤーの総合的な成長を象徴する城。",
    metric: "level",
    thresholds: [10, 20, 30, 50, 100],
    requiredTier: 1,
    sortOrder: 6,
  },
  {
    type: "library",
    name: "図書館",
    description: "学習時間の積み重ねで発展する知識の殿堂。",
    metric: "studyMinutesTotal",
    thresholds: [60, 300, 600, 1200, 3000],
    requiredTier: 1,
    sortOrder: 7,
  },
  {
    type: "academy",
    name: "アカデミー",
    description: "資格取得の実績で発展する教育機関。",
    metric: "qualificationsPassedCount",
    thresholds: [1, 2, 3, 5, 8],
    requiredTier: 1,
    sortOrder: 8,
  },
  {
    type: "monument",
    name: "記念碑",
    description: "ミッション達成の積み重ねを称える記念碑。",
    metric: "missionsClaimedTotal",
    thresholds: [5, 15, 30, 60, 100],
    requiredTier: 1,
    sortOrder: 9,
  },

  // --- Tier2: 町 ---
  {
    type: "market",
    name: "市場",
    description: "村を町へと押し上げた交易の証。",
    metric: "commitCount",
    thresholds: [100, 150, 250, 400, 600],
    requiredTier: 2,
    sortOrder: 10,
  },
  {
    type: "school",
    name: "学校",
    description: "町の子らが学ぶ、知識拡大の拠点。",
    metric: "studyMinutesTotal",
    thresholds: [500, 1000, 2000, 4000, 8000],
    requiredTier: 2,
    sortOrder: 11,
  },
  {
    type: "workshop",
    name: "工房",
    description: "職人たちが新しい提案を形にする場所。",
    metric: "prOpenCount",
    thresholds: [30, 50, 80, 120, 180],
    requiredTier: 2,
    sortOrder: 12,
  },
  {
    type: "watchtower",
    name: "見張り塔",
    description: "町を課題(Issue)から守る監視塔。",
    metric: "issueCloseCount",
    thresholds: [50, 80, 120, 180, 260],
    requiredTier: 2,
    sortOrder: 13,
  },

  // --- Tier3: 大きな町 ---
  {
    type: "cathedral",
    name: "大聖堂",
    description: "資格という名の信仰が集う大聖堂。",
    metric: "qualificationsPassedCount",
    thresholds: [3, 4, 5, 6, 8],
    requiredTier: 3,
    sortOrder: 14,
  },
  {
    type: "arena",
    name: "闘技場",
    description: "ミッション達成者を称える闘技場。",
    metric: "missionsClaimedTotal",
    thresholds: [40, 60, 90, 130, 180],
    requiredTier: 3,
    sortOrder: 15,
  },
  {
    type: "harbor",
    name: "港",
    description: "マージされた成果が世界へ出ていく港。",
    metric: "prMergeCount",
    thresholds: [60, 90, 130, 180, 250],
    requiredTier: 3,
    sortOrder: 16,
  },
  {
    type: "observatory",
    name: "天文台",
    description: "プレイヤーの成長を映す天文台。",
    metric: "level",
    thresholds: [15, 20, 25, 30, 40],
    requiredTier: 3,
    sortOrder: 17,
  },

  // --- Tier4: 帝国 ---
  {
    type: "grand_library",
    name: "大図書館",
    description: "帝国の叡智を蓄える大図書館。",
    metric: "studyMinutesTotal",
    thresholds: [2000, 3000, 4500, 6500, 9000],
    requiredTier: 4,
    sortOrder: 18,
  },
  {
    type: "colosseum",
    name: "大闘技場",
    description: "帝国中のコミットを称える大闘技場。",
    metric: "commitCount",
    thresholds: [300, 450, 650, 900, 1200],
    requiredTier: 4,
    sortOrder: 19,
  },
  {
    type: "senate",
    name: "元老院",
    description: "課題解決の実績で選ばれし者が集う。",
    metric: "issueCloseCount",
    thresholds: [150, 220, 300, 400, 520],
    requiredTier: 4,
    sortOrder: 20,
  },
  {
    type: "shipyard",
    name: "造船所",
    description: "帝国の成果を運ぶ船を造る造船所。",
    metric: "prMergeCount",
    thresholds: [150, 220, 300, 400, 520],
    requiredTier: 4,
    sortOrder: 21,
  },

  // --- Tier5: 王国 ---
  {
    type: "royal_palace",
    name: "王宮",
    description: "王国の頂点、プレイヤー自身の成長を映す王宮。",
    metric: "level",
    thresholds: [25, 30, 35, 40, 50],
    requiredTier: 5,
    sortOrder: 22,
  },
  {
    type: "great_academy",
    name: "大アカデミー",
    description: "王国の未来を担う人材を育てる大アカデミー。",
    metric: "qualificationsPassedCount",
    thresholds: [5, 6, 7, 8, 10],
    requiredTier: 5,
    sortOrder: 23,
  },
  {
    type: "trade_hub",
    name: "交易拠点",
    description: "王国中の提案(Pull Request)が集まる交易拠点。",
    metric: "prOpenCount",
    thresholds: [150, 220, 300, 400, 520],
    requiredTier: 5,
    sortOrder: 24,
  },
  {
    type: "monastery",
    name: "大修道院",
    description: "ミッションの積み重ねを見守る大修道院。",
    metric: "missionsClaimedTotal",
    thresholds: [100, 140, 190, 250, 320],
    requiredTier: 5,
    sortOrder: 25,
  },

  // --- Tier6: 国 ---
  {
    type: "imperial_capital",
    name: "帝都",
    description: "国の中心、プレイヤーの集大成である帝都。",
    metric: "level",
    thresholds: [40, 50, 60, 75, 100],
    requiredTier: 6,
    sortOrder: 26,
  },
  {
    type: "world_tree",
    name: "世界樹",
    description: "国中の学びが集う世界樹。",
    metric: "studyMinutesTotal",
    thresholds: [6000, 9000, 13000, 18000, 25000],
    requiredTier: 6,
    sortOrder: 27,
  },
  {
    type: "grand_colosseum",
    name: "世界闘技場",
    description: "国を挙げてコミットを称える世界闘技場。",
    metric: "commitCount",
    thresholds: [800, 1200, 1700, 2400, 3200],
    requiredTier: 6,
    sortOrder: 28,
  },
  {
    type: "throne_room",
    name: "玉座の間",
    description: "国王が全ての達成を見守る玉座の間。",
    metric: "missionsClaimedTotal",
    thresholds: [200, 280, 380, 500, 650],
    requiredTier: 6,
    sortOrder: 29,
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

// unlockConditionがnullの実績は、コード側のイベントフラグ(isFirstSyncなど)で判定する。
// それ以外は lib/game/unlockConditions.ts の指標(UnlockMetric)に対する
// しきい値判定(metric >= value)で自動アンロックされる。
const achievementMasters = [
  {
    type: "first_sync",
    name: "はじめの一歩",
    condition: "初回のGitHub同期を完了する",
    unlockCondition: Prisma.JsonNull,
  },
  {
    type: "streak_7",
    name: "習慣化",
    condition: "最長連続活動日数が7日以上になる",
    unlockCondition: { metric: "longestStreak", operator: ">=", value: 7 },
  },
  {
    type: "streak_30",
    name: "不屈の継続者",
    condition: "最長連続活動日数が30日以上になる",
    unlockCondition: { metric: "longestStreak", operator: ">=", value: 30 },
  },
  {
    type: "commit_100",
    name: "百の頂",
    condition: "累計コミット数が100件以上になる",
    unlockCondition: { metric: "commitCount", operator: ">=", value: 100 },
  },
  {
    type: "commit_500",
    name: "コミットの化身",
    condition: "累計コミット数が500件以上になる",
    unlockCondition: { metric: "commitCount", operator: ">=", value: 500 },
  },
  {
    type: "issue_close_50",
    name: "課題解決人",
    condition: "累計Issueクローズ数が50件以上になる",
    unlockCondition: { metric: "issueCloseCount", operator: ">=", value: 50 },
  },
  {
    type: "pr_open_50",
    name: "提案の達人",
    condition: "累計Pull Request作成数が50件以上になる",
    unlockCondition: { metric: "prOpenCount", operator: ">=", value: 50 },
  },
  {
    type: "pr_merge_10",
    name: "マージ職人",
    condition: "累計Pull Requestマージ数が10件以上になる",
    unlockCondition: { metric: "prMergeCount", operator: ">=", value: 10 },
  },
  {
    type: "quest_30",
    name: "継続は力なり",
    condition: "完了済みクエスト数が30件以上になる",
    unlockCondition: { metric: "questCompletedCount", operator: ">=", value: 30 },
  },
  {
    type: "study_600",
    name: "勉強家",
    condition: "累計学習時間が600分(10時間)以上になる",
    unlockCondition: { metric: "studyMinutesTotal", operator: ">=", value: 600 },
  },
  {
    type: "study_3000",
    name: "知識の探究者",
    condition: "累計学習時間が3000分(50時間)以上になる",
    unlockCondition: { metric: "studyMinutesTotal", operator: ">=", value: 3000 },
  },
  {
    type: "qualification_1",
    name: "有資格者",
    condition: "資格に1件以上合格する",
    unlockCondition: { metric: "qualificationsPassedCount", operator: ">=", value: 1 },
  },
  {
    type: "qualification_5",
    name: "資格コレクター",
    condition: "資格に5件以上合格する",
    unlockCondition: { metric: "qualificationsPassedCount", operator: ">=", value: 5 },
  },
  {
    type: "mission_50",
    name: "ミッションマスター",
    condition: "ミッション累計達成数が50件以上になる",
    unlockCondition: { metric: "missionsClaimedTotal", operator: ">=", value: 50 },
  },
  {
    type: "village_tier_town",
    name: "町の礎",
    condition: "村が町以上に発展する",
    unlockCondition: { metric: "villageTier", operator: ">=", value: 2 },
  },
  {
    type: "village_tier_kingdom",
    name: "王国の礎",
    condition: "村が王国以上に発展する",
    unlockCondition: { metric: "villageTier", operator: ">=", value: 5 },
  },
  {
    type: "village_tier_nation",
    name: "建国者",
    condition: "村が国(最終形態)まで発展する",
    unlockCondition: { metric: "villageTier", operator: ">=", value: 6 },
  },
  {
    type: "level_20",
    name: "熟練の証",
    condition: "プレイヤーレベル20に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 20 },
  },
  {
    type: "level_50",
    name: "頂への到達",
    condition: "プレイヤーレベル50に到達する",
    unlockCondition: { metric: "level", operator: ">=", value: 50 },
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
  {
    type: "streak_keeper",
    name: "継続の探求者",
    condition: "最長連続活動日数が14日以上になる",
    unlockCondition: { metric: "longestStreak", operator: ">=", value: 14 },
  },
  {
    type: "iron_will",
    name: "不屈の意志",
    condition: "最長連続活動日数が30日以上になる",
    unlockCondition: { metric: "longestStreak", operator: ">=", value: 30 },
  },
  {
    type: "bookworm",
    name: "知識の探求者",
    condition: "累計学習時間が1000分以上になる",
    unlockCondition: { metric: "studyMinutesTotal", operator: ">=", value: 1000 },
  },
  {
    type: "certified_hunter",
    name: "資格ハンター",
    condition: "資格に3件以上合格する",
    unlockCondition: { metric: "qualificationsPassedCount", operator: ">=", value: 3 },
  },
  {
    type: "mission_ace",
    name: "ミッションの達人",
    condition: "ミッション累計達成数が30件以上になる",
    unlockCondition: { metric: "missionsClaimedTotal", operator: ">=", value: 30 },
  },
  {
    type: "founding_ruler",
    name: "建国の王",
    condition: "村が国(最終形態)まで発展する",
    unlockCondition: { metric: "villageTier", operator: ">=", value: 6 },
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
