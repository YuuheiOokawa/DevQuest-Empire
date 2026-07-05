/*
  Warnings:

  - Made the column `metric` on table `BuildingMaster` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thresholds` on table `BuildingMaster` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AchievementMaster" ADD COLUMN     "unlockCondition" JSONB;

-- AlterTable
ALTER TABLE "BuildingMaster" ALTER COLUMN "metric" SET NOT NULL,
ALTER COLUMN "thresholds" SET NOT NULL;
