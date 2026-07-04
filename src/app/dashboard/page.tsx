import { redirect } from "next/navigation";

// ホーム画面は/に統合された。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function DashboardRedirectPage() {
  redirect("/");
}
