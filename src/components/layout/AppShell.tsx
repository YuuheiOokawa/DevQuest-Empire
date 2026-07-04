import { TopBar } from "@/components/layout/TopBar";
import { FooterNav } from "@/components/layout/FooterNav";
import { LevelUpProvider } from "@/components/levelup/LevelUpContext";

export function AppShell({
  children,
  initialLevel = null,
}: {
  children: React.ReactNode;
  initialLevel?: number | null;
}) {
  return (
    <LevelUpProvider initialLevel={initialLevel}>
      <TopBar />
      <div className="flex flex-1 flex-col pb-28">{children}</div>
      <FooterNav />
    </LevelUpProvider>
  );
}
