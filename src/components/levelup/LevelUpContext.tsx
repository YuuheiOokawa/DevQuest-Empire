"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { LevelUpModal, type LevelUpEvent } from "@/components/levelup/LevelUpModal";
import { useToast } from "@/components/toast/ToastContext";

// 成長アクション(クエスト完了・ミッション受取・GitHub同期・ログインボーナス・
// 学習記録・資格合格)のAPIレスポンスは、いずれもnewLevel/expGained/unlockedTitles/
// unlockedAchievements/unlockedBuildings/tierUpToを含む形になっている
// (lib/game/progression.ts, lib/game/quest.ts等参照)。このProvider配下であれば、
// どのクライアントコンポーネントからでもreportGrowthResultを呼ぶだけで
// レベルアップ演出・実績/称号/EXP獲得トーストの両方を出せるようにする。
export type GrowthActionResult = {
  newLevel: number;
  expGained?: number;
  unlockedTitles?: string[];
  unlockedAchievements?: string[];
  unlockedBuildings?: string[];
  leveledUpBuildings?: string[];
  tierUpTo?: string | null;
};

type LevelUpContextValue = {
  reportGrowthResult: (result: GrowthActionResult) => void;
};

const LevelUpContext = createContext<LevelUpContextValue | null>(null);

export function LevelUpProvider({
  initialLevel,
  children,
}: {
  initialLevel: number | null;
  children: ReactNode;
}) {
  const [, setLevel] = useState<number | null>(initialLevel);
  const [event, setEvent] = useState<LevelUpEvent | null>(null);
  const pushToast = useToast();

  const reportGrowthResult = useCallback(
    (result: GrowthActionResult) => {
      if (result.expGained) {
        pushToast({ kind: "exp", message: `+${result.expGained} EXP を獲得しました` });
      }
      for (const name of result.unlockedAchievements ?? []) {
        pushToast({ kind: "achievement", message: `実績「${name}」を解放しました` });
      }
      for (const name of result.unlockedBuildings ?? []) {
        pushToast({ kind: "building", message: `新しい建物「${name}」が建設されました` });
      }
      for (const name of result.leveledUpBuildings ?? []) {
        pushToast({ kind: "building", message: `「${name}」がレベルアップしました` });
      }

      setLevel((prevLevel) => {
        const isLevelUp = prevLevel != null && result.newLevel > prevLevel;
        if (isLevelUp) {
          setEvent({
            fromLevel: prevLevel,
            toLevel: result.newLevel,
            unlockedTitles: result.unlockedTitles ?? [],
            tierUpTo: result.tierUpTo ?? null,
          });
        } else {
          for (const name of result.unlockedTitles ?? []) {
            pushToast({ kind: "title", message: `称号「${name}」を獲得しました` });
          }
          if (result.tierUpTo) {
            pushToast({ kind: "tier", message: `村が「${result.tierUpTo}」に発展しました` });
          }
        }
        return result.newLevel;
      });
    },
    [pushToast]
  );

  return (
    <LevelUpContext.Provider value={{ reportGrowthResult }}>
      {children}
      {event && <LevelUpModal event={event} onClose={() => setEvent(null)} />}
    </LevelUpContext.Provider>
  );
}

/** Provider外で呼ばれた場合はno-opにする(安全側に倒す)。 */
export function useLevelUp(): (result: GrowthActionResult) => void {
  const ctx = useContext(LevelUpContext);
  return ctx?.reportGrowthResult ?? (() => {});
}
