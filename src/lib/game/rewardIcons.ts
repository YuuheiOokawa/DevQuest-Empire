import {
  Sparkles,
  Flame,
  GitCommitHorizontal,
  Bug,
  GitPullRequest,
  GitMerge,
  BookOpen,
  GraduationCap,
  Target,
  Castle,
  TrendingUp,
  ScrollText,
  Crown,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/** 実績のtypeはmetricごとに一定の接頭辞を持つため、パターンから自動でアイコンを決める。 */
export function achievementIcon(type: string): LucideIcon {
  if (type === "first_sync") return Sparkles;
  if (type.startsWith("streak_")) return Flame;
  if (type.startsWith("commit_")) return GitCommitHorizontal;
  if (type.startsWith("issue_close_")) return Bug;
  if (type.startsWith("pr_open_")) return GitPullRequest;
  if (type.startsWith("pr_merge_")) return GitMerge;
  if (type.startsWith("study_")) return BookOpen;
  if (type.startsWith("qualification_")) return GraduationCap;
  if (type.startsWith("mission_")) return Target;
  if (type.startsWith("village_tier_")) return Castle;
  if (type.startsWith("level_")) return TrendingUp;
  if (type.startsWith("quest_")) return ScrollText;
  return Trophy;
}

// 称号は命名が不規則なため、typeごとに明示的なアイコンを割り当てる。
const TITLE_ICONS: Record<string, LucideIcon> = {
  novice: Sparkles,
  apprentice: Sparkles,
  journeyman: TrendingUp,
  veteran: TrendingUp,
  legend: Crown,
  grandmaster: Crown,
  streak_keeper: Flame,
  iron_will: Flame,
  timeless: Flame,
  bookworm: BookOpen,
  sage: BookOpen,
  certified_hunter: GraduationCap,
  qualification_sage: GraduationCap,
  mission_ace: Target,
  mission_paragon: Target,
  commit_engraver: GitCommitHorizontal,
  issue_resolver: Bug,
  merge_artisan: GitMerge,
  quest_paragon: ScrollText,
  founding_ruler: Castle,
};

export function titleIcon(type: string): LucideIcon {
  return TITLE_ICONS[type] ?? Sparkles;
}

const MISSION_METRIC_ICONS: Record<string, LucideIcon> = {
  commitCount: GitCommitHorizontal,
  issueCloseCount: Bug,
  prOpenCount: GitPullRequest,
  prMergeCount: GitMerge,
  studyMinutes: BookOpen,
};

export function missionIcon(metric: string): LucideIcon {
  return MISSION_METRIC_ICONS[metric] ?? Target;
}
