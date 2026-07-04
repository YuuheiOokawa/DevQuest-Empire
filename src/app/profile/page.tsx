import { redirect } from "next/navigation";

// プロフィール画面は/playerに統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function ProfileRedirectPage() {
  redirect("/player");
}
