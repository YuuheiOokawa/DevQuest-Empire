import { prisma } from "@/lib/prisma";
import { getSeasonalDefaults } from "@/lib/game/season";

// イベント限定称号の実付与。
// 定義: 季節イベント開催中に「当月のクエスト達成10回」で、そのイベントの
// 限定称号を実際にPlayerTitleへ付与する(称号ページで装備可能になる)。
// 設計: 称号マスタはコード定義とし、TitleMaster.type(unique)でupsertして
// seed不要で自己完結させる。重複付与は@@unique(playerId,titleMasterId)で防ぐ。

export const EVENT_MISSION_TARGET = 10;

const EVENT_TITLES: Record<string, { type: string; name: string; condition: string }> = {
  sakura: { type: "event_sakura", name: "桜の勇者", condition: "桜祭りイベント中に月間クエスト10回達成" },
  summerFestival: { type: "event_summer", name: "夏祭りの覇者", condition: "夏祭りイベント中に月間クエスト10回達成" },
  halloween: { type: "event_halloween", name: "宵闇の狩人", condition: "ハロウィンイベント中に月間クエスト10回達成" },
  christmas: { type: "event_christmas", name: "聖夜の守護者", condition: "クリスマスイベント中に月間クエスト10回達成" },
};

/**
 * イベント限定称号の付与判定。新規付与した称号名の配列を返す(なければ空)。
 * クエスト完了直後に呼ぶ想定。イベント未開催・条件未達・付与済みなら何もしない。
 */
export async function grantEventTitleIfEligible(playerId: string): Promise<string[]> {
  const { eventTheme } = getSeasonalDefaults(new Date());
  const master = EVENT_TITLES[eventTheme as string];
  if (!master) return [];

  // 当月のクエスト達成数
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completed = await prisma.quest.count({
    where: { playerId, status: "completed", completedAt: { gte: monthStart } },
  });
  if (completed < EVENT_MISSION_TARGET) return [];

  // マスタをupsert(seed不要でコード定義から自己完結)
  const titleMaster = await prisma.titleMaster.upsert({
    where: { type: master.type },
    update: { name: master.name, condition: master.condition },
    create: {
      type: master.type,
      name: master.name,
      condition: master.condition,
      unlockCondition: { kind: "eventMonthlyQuests", target: EVENT_MISSION_TARGET },
      rarity: "gold",
    },
  });

  // 未付与なら付与(付与済みならP2002を握って空を返す)
  const existing = await prisma.playerTitle.findUnique({
    where: { playerId_titleMasterId: { playerId, titleMasterId: titleMaster.id } },
  });
  if (existing) return [];
  await prisma.playerTitle.create({ data: { playerId, titleMasterId: titleMaster.id } });
  return [master.name];
}
