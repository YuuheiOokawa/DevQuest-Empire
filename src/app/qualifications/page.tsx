import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQualificationsView } from "@/lib/game/qualifications";
import { AppNav } from "@/components/layout/AppNav";
import { QualificationList } from "@/components/qualifications/QualificationList";

export default async function QualificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const qualifications = await getQualificationsView(session.user.id);

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">資格</h1>
          <p className="text-muted-foreground text-sm">
            受験予定を管理し、合格すると+500EXPを獲得できます。
          </p>
        </div>

        {!qualifications ? (
          <p className="text-destructive text-sm">資格情報を取得できませんでした。</p>
        ) : (
          <QualificationList initialQualifications={qualifications} />
        )}
      </main>
    </>
  );
}
