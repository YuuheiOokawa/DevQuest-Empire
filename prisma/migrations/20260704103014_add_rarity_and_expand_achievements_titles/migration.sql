-- AlterTable
ALTER TABLE "AchievementMaster" ADD COLUMN     "rarity" TEXT NOT NULL DEFAULT 'bronze';

-- AlterTable
ALTER TABLE "TitleMaster" ADD COLUMN     "rarity" TEXT NOT NULL DEFAULT 'bronze';
