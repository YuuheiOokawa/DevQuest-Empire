import { redirect } from "next/navigation";

// ミッション画面は/adventureに統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function MissionsRedirectPage() {
  redirect("/adventure");
}
