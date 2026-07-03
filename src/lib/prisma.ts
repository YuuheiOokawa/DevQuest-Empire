import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ローカル開発環境(社内ネットワーク)のTLS中間プロキシにより、Postgres接続時の
// 証明書検証が失敗するため、ローカルに限りrejectUnauthorized: falseで回避する。
// Vercel上(本番/プレビュー)には中間プロキシが無いため正規の検証を行う。
// （Prismaのネイティブschema-engineバイナリはこの回避策が効かないため、
//   Migrateは scripts/db-apply-migration.mjs 経由で適用している）
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.VERCEL ? true : { rejectUnauthorized: false },
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
