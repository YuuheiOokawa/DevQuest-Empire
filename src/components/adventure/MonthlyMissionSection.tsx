import { MissionList, type MissionItem } from "@/components/missions/MissionList";

export function MonthlyMissionSection({ missions }: { missions: MissionItem[] }) {
  return <MissionList title="マンスリーミッション" initialMissions={missions} />;
}
