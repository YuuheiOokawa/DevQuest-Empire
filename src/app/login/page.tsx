import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DevQuest Empire</h1>
        <p className="text-muted-foreground">GitHubの草を、育てる。</p>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <Button type="submit" size="lg">
          GitHubでログイン
        </Button>
      </form>
    </main>
  );
}
