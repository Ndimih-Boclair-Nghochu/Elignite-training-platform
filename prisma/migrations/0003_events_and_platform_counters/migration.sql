ALTER TABLE "Student"
ADD COLUMN "graduationCounted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Settings"
ADD COLUMN "sessionStudentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lifetimeStudentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lifetimeGraduateCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Event" (
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

CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
