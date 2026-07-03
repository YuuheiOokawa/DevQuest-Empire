import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム" },
  { href: "/village", label: "村" },
  { href: "/quest", label: "クエスト" },
  { href: "/achievements", label: "実績" },
  { href: "/titles", label: "称号" },
  { href: "/settings/github", label: "GitHub連携" },
];

export function AppNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
        <div className="flex flex-1 gap-4 overflow-x-auto text-sm whitespace-nowrap">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </div>
        <form className="shrink-0"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            ログアウト
          </Button>
        </form>
      </nav>
    </header>
  );
}
