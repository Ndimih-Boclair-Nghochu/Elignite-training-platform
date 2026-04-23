-- CreateTable
CREATE TABLE "SchoolSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schoolName" TEXT NOT NULL DEFAULT 'Computer Training Institute',
    "schoolLogoUrl" TEXT,
    "ceoFirstName" TEXT NOT NULL DEFAULT 'Dr.',
    "ceoLastName" TEXT NOT NULL DEFAULT 'John Smith',
    "ceoTitle" TEXT NOT NULL DEFAULT 'Chief Executive Officer',
    "schoolMotto" TEXT,
    "schoolAddress" TEXT,
    "schoolPhone" TEXT,
    "schoolEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "phone" TEXT,
    "photoUrl" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "firstName", "id", "isActivated", "lastName", "password", "phone", "photoUrl", "role", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "isActivated", "lastName", "password", "phone", "photoUrl", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_matricule_key" ON "User"("matricule");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
