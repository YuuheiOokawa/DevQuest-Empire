import { useEffect, useState } from "react";
import type { QualityTier } from "../types/worldTypes";

function resolveQuality(width: number): QualityTier {
  if (width < 400) return "low";
  if (width < 768) return "mid";
  return "high";
}

// 端末幅から品質ティアを決定する。SSR中/初回マウント直後は"mid"を返し、
// ハイドレーション不整合(サーバーとクライアントで表示が食い違う警告)を避ける。
export function useResponsiveQuality(): QualityTier {
  const [quality, setQuality] = useState<QualityTier>("mid");

  useEffect(() => {
    const update = () => setQuality(resolveQuality(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return quality;
}
