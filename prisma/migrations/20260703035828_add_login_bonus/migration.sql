-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "lastLoginBonusAt" DATE,
ADD COLUMN     "loginBonusStreak" INTEGER NOT NULL DEFAULT 0;
