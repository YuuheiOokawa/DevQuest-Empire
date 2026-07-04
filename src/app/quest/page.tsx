import { redirect } from "next/navigation";

// クエスト画面は/adventureに統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function QuestRedirectPage() {
  redirect("/adventure");
}
