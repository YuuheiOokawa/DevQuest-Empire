import type { ActivityMetrics } from "@/lib/game/metrics";
import type { QualificationView } from "@/lib/game/qualifications";
import type { SettlementInfo } from "@/lib/game/settlement";

// MVP: ルールベースの簡易サジェスト。
// 将来的にClaude APIを使った動的生成(questPrompt.ts / activityCommentPrompt.tsと同様の構成)に
// 置き換えられるよう、入力(実データ)→出力(文字列)のシンプルな関数として切り出している。

export function getLearningSuggestion(metrics: ActivityMetrics): string {
  if (metrics.studyMinutesTotal < 60) {
    return "学習記録がまだ少ないようです。今日は10分だけでも学習時間を記録してみましょう。";
  }
  if (metrics.commitCount > 0 && metrics.studyMinutesTotal < metrics.commitCount * 10) {
    return "コミットは順調です。次は新しい技術のキャッチアップに学習時間を使ってみましょう。";
  }
  return "学習ペースは良好です。この調子で継続していきましょう。";
}

export type CertificationSuggestion = {
  title: string;
  description: string;
};

export function getCertificationSuggestion(
  qualifications: QualificationView[] | null
): CertificationSuggestion {
  const notStarted = qualifications?.find((q) => q.status === "not_started");
  if (notStarted) {
    return {
      title: notStarted.name,
      description: `${notStarted.category}のスキルを証明する資格です。受験を計画してみませんか?`,
    };
  }
  return {
    title: "すべての資格に着手済みです",
    description: "計画中・合格済みの資格をプレイヤー画面で確認してみましょう。",
  };
}

export function getWorldAdvice(settlement: SettlementInfo | null): string {
  if (!settlement) {
    return "ワールドの情報を取得できませんでした。";
  }
  if (!settlement.nextTierName) {
    return "村はすでに最高の発展段階「国」に到達しています。素晴らしい成果です。";
  }
  const remaining = Math.max(
    (settlement.requiredScoreForNextTier ?? 0) - settlement.scoreInCurrentTier,
    0
  );
  return `次の発展段階「${settlement.nextTierName}」まで、あと${remaining}ポイントです。建物のレベルアップを進めましょう。`;
}
