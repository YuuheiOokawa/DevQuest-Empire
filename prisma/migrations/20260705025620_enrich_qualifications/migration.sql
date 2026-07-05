-- AlterTable
ALTER TABLE "QualificationMaster" ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "expReward" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "recommendedOrder" INTEGER NOT NULL DEFAULT 0;
