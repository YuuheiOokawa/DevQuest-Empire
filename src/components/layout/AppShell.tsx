import { TopBar } from "@/components/layout/TopBar";
import { FooterNav } from "@/components/layout/FooterNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="flex flex-1 flex-col pb-20">{children}</div>
      <FooterNav />
    </>
  );
}
