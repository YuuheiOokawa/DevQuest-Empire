import { Scroll, Target, Gift, RefreshCw, Castle, type LucideIcon } from "lucide-react";

export type RecommendedAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type RecommendationInput = {
  questCompleted: boolean;
  claimableMissionCount: number;
  loginBonusClaimedToday: boolean;
  last7DaysCommits: number;
  nextTierName: string | null;
};

/**
 * ホーム画面の「次にやるべきおすすめアクション」を1件だけ選ぶ。
 * 優先度: 今日のクエスト > 受取可能なミッション > ログインボーナス > GitHub同期 > 村の発展。
 */
export function getRecommendedAction(input: RecommendationInput): RecommendedAction {
  if (!input.questCompleted) {
    return {
      title: "今日のクエストを達成しよう",
      description: "AIが提案するクエストに挑戦してEXPを獲得しましょう。",
      href: "/adventure",
      icon: Scroll,
    };
  }

  if (input.claimableMissionCount > 0) {
    return {
      title: `受け取り可能なミッションが${input.claimableMissionCount}件あります`,
      description: "冒険画面からミッション報酬を受け取りましょう。",
      href: "/adventure",
      icon: Target,
    };
  }

  if (!input.loginBonusClaimedToday) {
    return {
      title: "ログインボーナスを受け取ろう",
      description: "毎日受け取ると連続日数ボーナスが増えていきます。",
      href: "/",
      icon: Gift,
    };
  }

  if (input.last7DaysCommits === 0) {
    return {
      title: "GitHubを同期してみよう",
      description: "最近の活動が同期されていません。同期してEXPを獲得しましょう。",
      href: "/",
      icon: RefreshCw,
    };
  }

  return {
    title: input.nextTierName
      ? `村を${input.nextTierName}へ発展させよう`
      : "ワールドの状況を確認しよう",
    description: "建物の成長状況を確認してみましょう。",
    href: "/world",
    icon: Castle,
  };
}
