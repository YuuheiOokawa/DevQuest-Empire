import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getVillageBuildingsView } from "@/lib/game/buildings";
import { AppNav } from "@/components/layout/AppNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function VillagePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const buildings = await getVillageBuildingsView(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">村</h1>
        <p className="text-muted-foreground text-sm">
          GitHubでの活動に応じて建物が増えていきます。
        </p>
      </div>

      {!buildings ? (
        <p className="text-destructive text-sm">村の情報を取得できませんでした。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {buildings.map((building) => (
            <Card
              key={building.type}
              className={building.unlocked ? "" : "opacity-50 grayscale"}
            >
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{building.name}</span>
                  {building.unlocked ? (
                    <Badge>アンロック済み</Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="size-3" />
                      未アンロック
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {building.description}
                </p>
                {building.unlocked && building.unlockedAt && (
                  <p className="text-muted-foreground text-xs">
                    建設日:{" "}
                    {new Date(building.unlockedAt).toLocaleDateString("ja-JP")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </main>
    </>
  );
}
