-- CreateTable
CREATE TABLE "AboutUs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vision" TEXT NOT NULL,
    "visionImageUrl" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "missionImageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
