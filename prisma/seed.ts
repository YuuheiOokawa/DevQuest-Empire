import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// マスタデータ定義の根拠: 18_Phase3_Detailed_Design.md Part2 / Part3

const buildingMasters = [
  {
    type: "house_small",
    name: "家",
    description: "はじめての一歩。GitHubへの最初のコミットで建つ。",
    unlockCondition: { metric: "commitCount", operator: ">=", value: 1 },
    sortOrder: 0,
  },
  {
    type: "house_large",
    name: "大きな家",
    description: "積み重ねたコミットの証。累計50コミットで建つ。",
    unlockCondition: { metric: "commitCount", operator: ">=", value: 50 },
    sortOrder: 1,
  },
  {
    type: "blacksmith",
    name: "鍛冶屋",
    description: "Issueを解決する腕が認められた証。累計5件のIssue Closeで建つ。",
    unlockCondition: { metric: "issueCloseCount", operator: ">=", value: 5 },
    sortOrder: 2,
  },
  {
    type: "guild",
    name: "ギルド",
    description: "多くの課題を解決してきた開発者が集う場所。累計20件のIssue Closeで建つ。",
    unlockCondition: { metric: "issueCloseCount", operator: ">=", value: 20 },
    sortOrder: 3,
  },
  {
    type: "tavern",
    name: "酒場",
    description: "提案が集まる場所。累計5件のPull Request作成で建つ。",
    unlockCondition: { metric: "prOpenCount", operator: ">=", value: 5 },
    sortOrder: 4,
  },
  {
    type: "dev_base",
    name: "開発拠点",
    description: "マージされた成果の結晶。累計10件のPull Request Mergeで建つ。",
    unlockCondition: { metric: "prMergeCount", operator: ">=", value: 10 },
    sortOrder: 5,
  },
  {
    type: "castle",
    name: "城",
    description: "総合的な成長の証。プレイヤーレベル10到達で建つ。",
    unlockCondition: { metric: "level", operator: ">=", value: 10 },
    sortOrder: 6,
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

  // FallbackQuestはユニークキーを持たないため、毎回全消し→再投入する
  await prisma.fallbackQuest.deleteMany();
  await prisma.fallbackQuest.createMany({ data: fallbackQuests });

  console.log(
    `Seed完了: BuildingMaster ${buildingMasters.length}件 / AchievementMaster ${achievementMasters.length}件 / FallbackQuest ${fallbackQuests.length}件`
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
