import { redirect } from "next/navigation";
import Image from "next/image";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/icon.png"
          alt="DevQuest Empire"
          width={96}
          height={96}
          className="rounded-2xl shadow-md"
          priority
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            DevQuest Empire
          </h1>
          <p className="text-muted-foreground">GitHubの草を、育てる。</p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/" });
        }}
      >
        <Button type="submit" size="lg">
          GitHubでログイン
        </Button>
      </form>
    </main>
  );
}
