import Link from "next/link";
import Image from "next/image";
import { MoreMenu } from "@/components/layout/MoreMenu";

export function TopBar() {
  return (
    <header className="bg-background/95 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/icon.png"
          alt=""
          width={28}
          height={28}
          className="rounded-lg"
        />
        <span className="font-bold tracking-tight">DevQuest Empire</span>
      </Link>
      <MoreMenu />
    </header>
  );
}
