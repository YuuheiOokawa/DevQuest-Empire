-- CreateTable
CREATE TABLE "StudyLog" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "note" TEXT,
    "expAwarded" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualificationMaster" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "QualificationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQualification" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "qualificationMasterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "examDate" DATE,
    "passedDate" DATE,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerQualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QualificationMaster_type_key" ON "QualificationMaster"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerQualification_playerId_qualificationMasterId_key" ON "PlayerQualification"("playerId", "qualificationMasterId");

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQualification" ADD CONSTRAINT "PlayerQualification_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQualification" ADD CONSTRAINT "PlayerQualification_qualificationMasterId_fkey" FOREIGN KEY ("qualificationMasterId") REFERENCES "QualificationMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
