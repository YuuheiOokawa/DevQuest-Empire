import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMissionsView } from "@/lib/game/missions";
import { AppNav } from "@/components/layout/AppNav";
import { MissionList } from "@/components/missions/MissionList";

export default async function MissionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const missions = await getMissionsView(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">ミッション</h1>
          <p className="text-muted-foreground text-sm">
            GitHub活動の目標を達成して追加の経験値を受け取りましょう。
          </p>
        </div>

        {!missions ? (
          <p className="text-destructive text-sm">
            ミッション情報を取得できませんでした。
          </p>
        ) : (
          <>
            <MissionList
              title="デイリー"
              initialMissions={missions.filter((m) => m.period === "daily")}
            />
            <MissionList
              title="ウィークリー"
              initialMissions={missions.filter((m) => m.period === "weekly")}
            />
          </>
        )}
      </main>
    </>
  );
}
