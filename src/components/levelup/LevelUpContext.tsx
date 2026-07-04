"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { LevelUpModal, type LevelUpEvent } from "@/components/levelup/LevelUpModal";

// 成長アクション(クエスト完了・ミッション受取・GitHub同期・ログインボーナス・
// 学習記録・資格合格)のAPIレスポンスは、いずれもnewLevel/unlockedTitles/tierUpToを
// 含む形になっている(lib/game/progression.ts参照)。このProvider配下であれば、
// どのクライアントコンポーネントからでもreportGrowthResultを呼ぶだけで
// レベルアップ判定・演出表示ができるようにする。
export type GrowthActionResult = {
  newLevel: number;
  unlockedTitles?: string[];
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

  const reportGrowthResult = useCallback((result: GrowthActionResult) => {
    setLevel((prevLevel) => {
      if (prevLevel != null && result.newLevel > prevLevel) {
        setEvent({
          fromLevel: prevLevel,
          toLevel: result.newLevel,
          unlockedTitles: result.unlockedTitles ?? [],
          tierUpTo: result.tierUpTo ?? null,
        });
      }
      return result.newLevel;
    });
  }, []);

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
