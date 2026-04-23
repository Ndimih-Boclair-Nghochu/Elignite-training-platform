-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SchoolSettings" (
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
    "aiName" TEXT NOT NULL DEFAULT 'EduAssistant',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SchoolSettings" ("ceoFirstName", "ceoLastName", "ceoTitle", "createdAt", "id", "schoolAddress", "schoolEmail", "schoolLogoUrl", "schoolMotto", "schoolName", "schoolPhone", "updatedAt") SELECT "ceoFirstName", "ceoLastName", "ceoTitle", "createdAt", "id", "schoolAddress", "schoolEmail", "schoolLogoUrl", "schoolMotto", "schoolName", "schoolPhone", "updatedAt" FROM "SchoolSettings";
DROP TABLE "SchoolSettings";
ALTER TABLE "new_SchoolSettings" RENAME TO "SchoolSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
