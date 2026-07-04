import {
  Scroll,
  Target,
  Gift,
  RefreshCw,
  Castle,
  GraduationCap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

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
  hasSyncedRepository: boolean;
  hasQualificationInProgress: boolean;
  currentExp: number;
  expToNextLevel: number;
  nextTierName: string | null;
};

const NEAR_LEVEL_UP_RATE = 0.2;

/**
 * ホーム画面の「今日のおすすめアクション」を1件だけ選ぶ。
 * 優先度: 今日のクエスト > レベルアップ目前 > 受取可能なミッション >
 *         GitHub未同期 > ログインボーナス > 資格未設定 > 村の発展。
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

  const remainingExp = input.expToNextLevel - input.currentExp;
  if (
    input.expToNextLevel > 0 &&
    remainingExp <= input.expToNextLevel * NEAR_LEVEL_UP_RATE
  ) {
    return {
      title: "あと少しでレベルアップです!",
      description: `あと${remainingExp}EXPで次のレベルに到達します。もうひと頑張りしましょう。`,
      href: "/adventure",
      icon: TrendingUp,
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

  if (!input.hasSyncedRepository) {
    return {
      title: "GitHub活動を同期しましょう",
      description: "リポジトリを連携すると、活動がEXPや村の発展に反映されます。",
      href: "/",
      icon: RefreshCw,
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

  if (!input.hasQualificationInProgress) {
    return {
      title: "次に目指す資格を設定しましょう",
      description: "資格に挑戦すると合格時に大きなEXPを獲得できます。",
      href: "/player",
      icon: GraduationCap,
    };
  }

  return {
    title: input.nextTierName
      ? `村を${input.nextTierName}へ発展させよう`
      : "ワールドの状況を確認しよう",
    description: "ミッションをこなして村の発展を進めましょう。",
    href: "/world",
    icon: Castle,
  };
}
