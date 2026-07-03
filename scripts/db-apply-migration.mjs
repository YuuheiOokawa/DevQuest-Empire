// 社内ネットワークが Prisma の schema-engine バイナリ単体からの
// DBへの直接接続をブロックしているため（node.exe 経由の接続は成功する）、
// `prisma migrate dev` の代わりに `pg` パッケージ経由でマイグレーションSQLを適用し、
// Prismaの管理テーブル `_prisma_migrations` に手動で記録するワークアラウンド。
//
// 使い方: node scripts/db-apply-migration.mjs <migrations/配下のフォルダ名>
// 例:     node scripts/db-apply-migration.mjs 20260703004843_init

import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { Client } from "pg";
import "dotenv/config";

const migrationDirName = process.argv[2];
if (!migrationDirName) {
  console.error("Usage: node scripts/db-apply-migration.mjs <migration_dir_name>");
  process.exit(1);
}

const migrationPath = path.join(
  process.cwd(),
  "prisma",
  "migrations",
  migrationDirName,
  "migration.sql"
);
const sql = readFileSync(migrationPath, "utf-8");
const checksum = createHash("sha256").update(sql).digest("hex");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) NOT NULL PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const { rows } = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = $1`,
    [migrationDirName]
  );
  if (rows.length > 0) {
    console.log(`Migration ${migrationDirName} は既に適用済みとして記録されています。スキップします。`);
    await client.end();
    return;
  }

  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(
      `INSERT INTO "_prisma_migrations"
        (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), now(), 1)`,
      [randomUUID(), checksum, migrationDirName]
    );
    await client.query("COMMIT");
    console.log(`Migration ${migrationDirName} を適用し、記録しました。`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
