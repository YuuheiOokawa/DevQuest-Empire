import type { EventTheme, Tier } from "../types/worldTypes";

// AudioSystemは設計のみ。実音声ファイルがリポジトリに存在しないため、
// 実際の再生は行わない no-op 実装にとどめる。
//
// 将来 Howler.js を導入する際は、このファイルの内部実装だけを差し替えれば
// 呼び出し側(Building3D の onSelect、CameraSystem のティアアップ演出等)は
// 変更不要になるように設計している。想定する音源は以下の通り:
//
// - BGM: ティアごとに1曲(TIER_BGM[tier])。EventTheme指定時はイベント用BGMに切替。
// - Ambient: 川のせせらぎ(WaterSystem)・風(SkySystem)・市場のざわめき(commerce区画)・
//   鍛冶屋の音(blacksmith建物)をループ再生。
// - SFX: 建物クリック音、建物レベルアップ音、ティアアップ音。
//
// import { Howl } from "howler"; // 導入時にコメントアウトを外す

export type SfxKey = "click" | "buildLevelUp" | "tierUp";
export type AmbientKey = "river" | "wind" | "market" | "blacksmith";

export type AudioSystemHandle = {
  playSfx: (key: SfxKey) => void;
  playAmbient: (key: AmbientKey) => void;
  stopAmbient: (key: AmbientKey) => void;
  setBgmForTier: (tier: Tier, eventTheme?: EventTheme) => void;
};

// TODO: Howler.js導入時にここへ実ファイルパスを追加する。
// export const TIER_BGM: Record<Tier, string> = { 1: "/audio/bgm/tier1.mp3", ... };

export function useAudioSystem(): AudioSystemHandle {
  return {
    playSfx: () => {
      // no-op: 音声ファイル未導入
    },
    playAmbient: () => {
      // no-op: 音声ファイル未導入
    },
    stopAmbient: () => {
      // no-op: 音声ファイル未導入
    },
    setBgmForTier: () => {
      // no-op: 音声ファイル未導入
    },
  };
}
