import { Inbox } from "lucide-react";
import { MissionList, type MissionItem } from "@/components/missions/MissionList";

export function DailyMissionSection({ missions }: { missions: MissionItem[] }) {
  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Inbox className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm">
          現在デイリーミッションはありません。
        </p>
      </div>
    );
  }
  return <MissionList title="デイリーミッション" initialMissions={missions} />;
}
