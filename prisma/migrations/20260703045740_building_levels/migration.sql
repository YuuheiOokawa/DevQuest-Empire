-- AlterTable
-- metric/thresholds は一旦NULL許容で追加し、直後にseed.tsの一括upsertで
-- 全行(既存7件+新規3件)に値を投入する運用のため、ここではNOT NULL制約を付けない。
ALTER TABLE "BuildingMaster" DROP COLUMN "unlockCondition",
ADD COLUMN     "metric" TEXT,
ADD COLUMN     "thresholds" JSONB;

-- AlterTable
ALTER TABLE "VillageBuilding" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;
