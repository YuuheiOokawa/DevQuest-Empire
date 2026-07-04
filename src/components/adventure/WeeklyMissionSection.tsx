import { MissionList, type MissionItem } from "@/components/missions/MissionList";

export function WeeklyMissionSection({ missions }: { missions: MissionItem[] }) {
  return <MissionList title="ウィークリーミッション" initialMissions={missions} />;
}
