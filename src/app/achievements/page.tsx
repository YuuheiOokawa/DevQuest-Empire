import { redirect } from "next/navigation";

// 実績画面は/player(実績タブ)に統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function AchievementsRedirectPage() {
  redirect("/player");
}
