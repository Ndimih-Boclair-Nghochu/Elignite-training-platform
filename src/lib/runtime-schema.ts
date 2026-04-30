import { prisma } from "@/lib/prisma";

let ensured = false;
let ensuring: Promise<void> | null = null;

export async function ensureRuntimeSchema() {
  if (ensured) {
    return;
  }

  if (ensuring) {
    return ensuring;
  }

  ensuring = (async () => {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "sessionStudentCount" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "lifetimeStudentCount" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "lifetimeGraduateCount" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
      ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "graduationCounted" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "programCode" TEXT;
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
      ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "programId" INTEGER;
      ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fromUserId" INTEGER;
      ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toUserId" INTEGER;
      ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toProgramId" INTEGER;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Event" (
          "id" SERIAL NOT NULL,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "excerpt" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "eventDate" TIMESTAMP(3) NOT NULL,
          "location" TEXT,
          "coverImageUrl" TEXT NOT NULL,
          "videoUrl" TEXT,
          "galleryItems" JSONB,
          "isPublished" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Settings" ("id", "applicationsOpen", "applicationYear", "maintenanceMode", "updatedAt")
      VALUES (1, true, '2026 Cohort', false, NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Program" p
      SET "programCode" = derived.code
      FROM (
        SELECT id, 'PRG-' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::text, 3, '0') AS code
        FROM "Program"
      ) AS derived
      WHERE p.id = derived.id
        AND (p."programCode" IS NULL OR p."programCode" = '');
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public' AND indexname = 'Event_slug_key'
        ) THEN
          CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public' AND indexname = 'Program_programCode_key'
        ) THEN
          CREATE UNIQUE INDEX "Program_programCode_key" ON "Program"("programCode");
        END IF;
      END $$;
    `);

    ensured = true;
  })().catch((error) => {
    ensuring = null;
    throw error;
  });

  return ensuring;
}
