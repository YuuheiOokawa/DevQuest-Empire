-- CreateTable
CREATE TABLE "MissionMaster" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "expReward" INTEGER NOT NULL,

    CONSTRAINT "MissionMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMissionProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "missionMasterId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "PlayerMissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissionMaster_type_key" ON "MissionMaster"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMissionProgress_playerId_missionMasterId_periodKey_key" ON "PlayerMissionProgress"("playerId", "missionMasterId", "periodKey");

-- AddForeignKey
ALTER TABLE "PlayerMissionProgress" ADD CONSTRAINT "PlayerMissionProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMissionProgress" ADD CONSTRAINT "PlayerMissionProgress_missionMasterId_fkey" FOREIGN KEY ("missionMasterId") REFERENCES "MissionMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
