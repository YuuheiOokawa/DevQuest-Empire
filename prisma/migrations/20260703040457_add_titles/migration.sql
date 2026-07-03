-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "equippedTitleId" TEXT;

-- CreateTable
CREATE TABLE "TitleMaster" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "unlockCondition" JSONB NOT NULL,

    CONSTRAINT "TitleMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTitle" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "titleMasterId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TitleMaster_type_key" ON "TitleMaster"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTitle_playerId_titleMasterId_key" ON "PlayerTitle"("playerId", "titleMasterId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_equippedTitleId_fkey" FOREIGN KEY ("equippedTitleId") REFERENCES "TitleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTitle" ADD CONSTRAINT "PlayerTitle_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTitle" ADD CONSTRAINT "PlayerTitle_titleMasterId_fkey" FOREIGN KEY ("titleMasterId") REFERENCES "TitleMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
