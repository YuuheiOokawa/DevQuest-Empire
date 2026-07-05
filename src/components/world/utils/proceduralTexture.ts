import { CanvasTexture, RepeatWrapping } from "three";

// 外部アセットを一切使わず、Canvas 2Dで生成するノイズテクスチャ。
// meshStandardMaterialのmapはcolorと乗算されるため、明度中心(ほぼ白)の
// 濃淡だけを描き、色味はマテリアル側のcolorに任せる。
// 生成コストを抑えるため種類ごとにモジュールスコープでキャッシュする。

export type NoiseKind = "grass" | "soil" | "stone" | "rock";

const cache = new Map<string, CanvasTexture>();

// 決定的な乱数(毎回同じ模様になるようにする)
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawGrass(ctx: CanvasRenderingContext2D, size: number, rand: () => number) {
  ctx.fillStyle = "#f2f2ee";
  ctx.fillRect(0, 0, size, size);
  // 短い縦ストロークで芝の毛羽立ちを表現
  for (let i = 0; i < 4200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 1.5 + rand() * 3;
    const dark = rand() > 0.45;
    const alpha = 0.05 + rand() * 0.12;
    ctx.strokeStyle = dark ? `rgba(30,50,20,${alpha})` : `rgba(255,255,240,${alpha + 0.04})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 1.5, y - len);
    ctx.stroke();
  }
  // 大きめの明暗ムラ(パッチ)
  for (let i = 0; i < 26; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 10 + rand() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rand() > 0.5;
    g.addColorStop(0, dark ? "rgba(20,40,15,0.10)" : "rgba(255,255,235,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function drawSoil(ctx: CanvasRenderingContext2D, size: number, rand: () => number) {
  ctx.fillStyle = "#f0ece4";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.5 + rand() * 1.6;
    const dark = rand() > 0.4;
    ctx.fillStyle = dark
      ? `rgba(60,40,20,${0.05 + rand() * 0.12})`
      : `rgba(255,250,235,${0.05 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // 轍(わだち)のような横方向のかすれ
  for (let i = 0; i < 40; i++) {
    const y = rand() * size;
    ctx.strokeStyle = `rgba(70,50,25,${0.03 + rand() * 0.05})`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (rand() - 0.5) * 8, size * 0.7, y + (rand() - 0.5) * 8, size, y);
    ctx.stroke();
  }
}

function drawStone(ctx: CanvasRenderingContext2D, size: number, rand: () => number) {
  ctx.fillStyle = "#efefec";
  ctx.fillRect(0, 0, size, size);
  // 石畳風の不規則ブロック
  const cell = size / 8;
  for (let gy = 0; gy < 8; gy++) {
    for (let gx = 0; gx < 8; gx++) {
      const x = gx * cell + (rand() - 0.5) * 3;
      const y = gy * cell + (rand() - 0.5) * 3;
      const shade = 0.03 + rand() * 0.09;
      ctx.fillStyle = rand() > 0.5 ? `rgba(40,40,45,${shade})` : `rgba(255,255,250,${shade})`;
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      ctx.strokeStyle = "rgba(30,30,35,0.16)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
    }
  }
}

function drawRock(ctx: CanvasRenderingContext2D, size: number, rand: () => number) {
  ctx.fillStyle = "#eceae6";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 6 + rand() * 22;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rand() > 0.45;
    g.addColorStop(0, dark ? "rgba(40,40,45,0.14)" : "rgba(255,255,250,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 斜めの筋(地層・岩肌)
  for (let i = 0; i < 30; i++) {
    const y = rand() * size;
    ctx.strokeStyle = `rgba(50,45,40,${0.04 + rand() * 0.06})`;
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y - size * (0.1 + rand() * 0.2));
    ctx.stroke();
  }
}

const DRAWERS: Record<NoiseKind, (ctx: CanvasRenderingContext2D, size: number, rand: () => number) => void> = {
  grass: drawGrass,
  soil: drawSoil,
  stone: drawStone,
  rock: drawRock,
};

export function getNoiseTexture(kind: NoiseKind, repeat = 6): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const key = `${kind}-${repeat}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  DRAWERS[kind](ctx, size, mulberry32(kind.length * 7919 + 42));

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}
