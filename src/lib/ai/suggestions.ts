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

// 資格ごとの学習アドバイス。学習中・受験予定の資格に対して、次に着手すべき
// 分野を具体的に示すことでルールベースでも実用的な提案になるようにする。
const QUALIFICATION_STUDY_TIPS: Record<string, string> = {
  java_silver: "まずは例外処理と継承を復習しましょう。",
  java_gold: "ラムダ式とStream APIの実践演習を重点的に進めましょう。",
  aws_clf: "AWSの主要サービス(EC2・S3・IAM)の役割を整理しましょう。",
  aws_saa: "VPC設計と可用性・冗長化のパターンを復習しましょう。",
  aws_dva: "Lambda・API Gatewayを使ったサーバーレス構成を復習しましょう。",
  az900: "Azureの基本サービスとクラウドの概念を整理しましょう。",
  az204: "Azure Functionsとストレージサービスの実装パターンを復習しましょう。",
  gcp_ace: "GCEとGKEの基本操作を実際に手を動かして確認しましょう。",
  lpic1: "Linuxのファイル権限とパッケージ管理コマンドを復習しましょう。",
  cka: "kubectlコマンドとPodのライフサイクルを復習しましょう。",
  comptia_security_plus: "暗号化と認証・認可の基礎を復習しましょう。",
  rails_gold: "Active Recordの関連付けとN+1問題の対策を復習しましょう。",
  python_cert: "リスト内包表記と例外処理の書き方を復習しましょう。",
  scrum_master: "スプリントイベントとスクラムの3つの役割を復習しましょう。",
  pmp: "プロジェクトの立ち上げ・計画プロセス群を復習しましょう。",
  itpassport: "ITの基礎用語と経営戦略分野を復習しましょう。",
  fe: "アルゴリズムの基礎とデータ構造を復習しましょう。",
  ap: "システム設計とセキュリティ分野を重点的に復習しましょう。",
  sg: "情報セキュリティの脅威と対策を復習しましょう。",
  sc: "暗号技術と認証プロトコルを重点的に復習しましょう。",
};

export function getCertificationSuggestion(
  qualifications: QualificationView[] | null
): CertificationSuggestion {
  const inProgress = qualifications?.find(
    (q) => q.status === "learning" || q.status === "planning"
  );
  if (inProgress) {
    const tip = QUALIFICATION_STUDY_TIPS[inProgress.type];
    return {
      title: inProgress.name,
      description: tip
        ? `${inProgress.name}を目指すなら、${tip}`
        : `${inProgress.category}の学習を今日も少しずつ進めましょう。`,
    };
  }

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

export function getLevelUpSuggestion(
  currentExp: number,
  expToNextLevel: number,
  questCompletedToday: boolean
): string {
  const remaining = Math.max(expToNextLevel - currentExp, 0);
  const isNear = expToNextLevel > 0 && remaining <= expToNextLevel * 0.2;

  if (isNear && !questCompletedToday) {
    return `あと${remaining}EXPでレベルアップです。今日のクエスト達成がおすすめです。`;
  }
  if (isNear) {
    return `あと${remaining}EXPでレベルアップです。この調子で活動を続けましょう。`;
  }
  return `次のレベルまであと${remaining}EXPです。コツコツ活動を積み重ねましょう。`;
}

export function getWorldAdvice(settlement: SettlementInfo | null): string {
  if (!settlement) {
    return "ワールドの情報を取得できませんでした。";
  }
  if (!settlement.nextTierName) {
    return "村はすでに最高の発展段階「天空帝国」に到達しています。素晴らしい成果です。";
  }
  const remaining = Math.max(
    (settlement.requiredScoreForNextTier ?? 0) - settlement.scoreInCurrentTier,
    0
  );
  return `次の発展段階「${settlement.nextTierName}」まで、あと${remaining}ポイントです。建物のレベルアップを進めましょう。`;
}
