import Link from "next/link";
import {
  LayoutDashboard,
  Castle,
  Scroll,
  Target,
  Trophy,
  Award,
  BookOpen,
  GraduationCap,
  GitBranch,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: LayoutDashboard },
  { href: "/village", label: "村", icon: Castle },
  { href: "/quest", label: "クエスト", icon: Scroll },
  { href: "/missions", label: "ミッション", icon: Target },
  { href: "/achievements", label: "実績", icon: Trophy },
  { href: "/titles", label: "称号", icon: Award },
  { href: "/study", label: "学習", icon: BookOpen },
  { href: "/qualifications", label: "資格", icon: GraduationCap },
  { href: "/settings/github", label: "GitHub連携", icon: GitBranch },
];

export function AppNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
        <div className="flex flex-1 gap-4 overflow-x-auto text-sm whitespace-nowrap">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 hover:underline"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
        <form
          className="shrink-0"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="size-4" />
            ログアウト
          </Button>
        </form>
      </nav>
    </header>
  );
}
