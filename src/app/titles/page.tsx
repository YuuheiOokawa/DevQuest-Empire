import { redirect } from "next/navigation";

// 称号画面は/player(称号タブ)に統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function TitlesRedirectPage() {
  redirect("/player");
}
