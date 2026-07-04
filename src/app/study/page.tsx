import { redirect } from "next/navigation";

// 学習記録は/player(統計タブ)に統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function StudyRedirectPage() {
  redirect("/player");
}
