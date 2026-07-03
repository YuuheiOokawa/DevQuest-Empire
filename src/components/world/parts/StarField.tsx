import { hashString, seededRandom } from "../utils/random";

export function StarField({
  count,
  radius,
  seedPrefix = "star",
  bigStarEvery = 0,
  intensity = 0.7,
}: {
  count: number;
  radius: number;
  seedPrefix?: string;
  bigStarEvery?: number;
  intensity?: number;
}) {
  if (count <= 0) return null;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`${seedPrefix}-${i}`);
        const x = (seededRandom(seed) - 0.5) * radius * 2.1;
        const y = 3 + seededRandom(seed * 2) * 2.6;
        const z = -radius * 0.85 + seededRandom(seed * 3) * radius * 0.8;
        const isBig = bigStarEvery > 0 && i % bigStarEvery === 0;
        const size = isBig ? 0.045 : 0.03;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 6, 4]} />
            <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={isBig ? intensity * 1.5 : intensity} />
          </mesh>
        );
      })}
    </group>
  );
}
