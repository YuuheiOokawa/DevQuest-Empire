import { redirect } from "next/navigation";

// 村画面は/worldにリネームされた。旧URLへのアクセスに備えてリダイレクトのみ残す。
export default function VillageRedirectPage() {
  redirect("/world");
}
