import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 社内ネットワークのTLS中間プロキシにより、Postgres接続時の証明書検証が
// 失敗するため、rejectUnauthorized: false でTLS検証をスキップしている。
// （Prismaのネイティブschema-engineバイナリはこの回避策が効かないため、
//   Migrateは scripts/db-apply-migration.mjs 経由で適用している）
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
