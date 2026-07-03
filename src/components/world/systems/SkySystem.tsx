import { getTierWorldConfig } from "../config/tierWorldConfig";
import { hashString, seededRandom } from "../utils/random";
import { Cloud3D } from "../parts/Cloud3D";
import { StarField } from "../parts/StarField";

// Canvasの背後に敷くDOM製の空(グラデーション+太陽/雲/星のCSS演出)。
// WebGLキャンバスの背景を透過させ、この空を通して見せることで
// 3D側は地形・建物に専念できるようにしている。
export function SkyBackdrop({ tier, dimming = 0 }: { tier: number; dimming?: number }) {
  const world = getTierWorldConfig(tier);
  return (
    <div className={`absolute inset-0 ${world.sky.css}`}>
      {tier <= 2 && (
        <>
          <div className="absolute top-4 right-8 size-12 rounded-full bg-yellow-100/80 shadow-[0_0_36px_12px_rgba(250,204,21,0.28)]" />
          <div className="absolute top-8 left-[12%] h-4 w-20 animate-pulse rounded-full bg-white/70 blur-[1px]" />
          <div className="absolute top-5 left-[48%] h-3 w-14 animate-pulse rounded-full bg-white/60 blur-[1px]" />
        </>
      )}
      {tier >= 3 &&
        Array.from({ length: Math.min(26, world.sky.starCount) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              left: `${6 + ((i * 17) % 88)}%`,
              top: `${4 + ((i * 11) % 30)}%`,
              width: tier >= 6 && i % 4 === 0 ? 3 : 2,
              height: tier >= 6 && i % 4 === 0 ? 3 : 2,
              opacity: 0.45 + (i % 5) * 0.1,
            }}
          />
        ))}
      {tier >= 5 && (
        <div
          className="absolute inset-x-0 top-0 h-32 opacity-60"
          style={{
            background: "repeating-conic-gradient(from 0deg at 82% 6%, rgba(253,224,71,0.58) 0deg 5deg, transparent 5deg 16deg)",
          }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/35 to-transparent" />
      {dimming > 0 && <div className="absolute inset-0 bg-slate-900" style={{ opacity: dimming }} />}
    </div>
  );
}

// Canvas内(3D空間)の雲と星。WeatherSystemの`cloudy`はcloudBoostで雲を増やす。
export function SkySceneLayer({
  tier,
  radius,
  cloudBoost = 0,
}: {
  tier: number;
  radius: number;
  cloudBoost?: number;
}) {
  const world = getTierWorldConfig(tier);
  const cloudCount = world.sky.cloudCount + cloudBoost;

  return (
    <group>
      <group>
        {Array.from({ length: cloudCount }).map((_, i) => {
          const seed = hashString(`cloud-${tier}-${i}`);
          return (
            <Cloud3D
              key={i}
              x={(seededRandom(seed) - 0.5) * radius * 1.7}
              z={-radius * 0.7 + seededRandom(seed * 2) * radius * 0.6}
              y={2.9 + seededRandom(seed * 3) * 1.2}
              scale={0.75 + seededRandom(seed * 4) * 0.65}
              speed={0.08 + seededRandom(seed * 5) * 0.08}
            />
          );
        })}
      </group>
      <StarField count={world.sky.starCount} radius={radius} seedPrefix={`star-${tier}`} bigStarEvery={tier >= 6 ? 4 : 0} intensity={tier >= 6 ? 1.1 : 0.7} />
    </group>
  );
}
