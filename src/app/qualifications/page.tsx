import { redirect } from "next/navigation";

// 資格画面は/player(資格タブ)に統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function QualificationsRedirectPage() {
  redirect("/player");
}
