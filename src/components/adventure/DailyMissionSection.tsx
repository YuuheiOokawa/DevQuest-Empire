import { MissionList, type MissionItem } from "@/components/missions/MissionList";

export function DailyMissionSection({ missions }: { missions: MissionItem[] }) {
  return <MissionList title="デイリーミッション" initialMissions={missions} />;
}
