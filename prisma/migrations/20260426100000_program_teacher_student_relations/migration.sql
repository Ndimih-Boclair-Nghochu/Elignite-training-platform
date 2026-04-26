-- ============================================================
-- MIGRATION: Full Program-Teacher-Student relationship redesign
-- ============================================================

-- 1. Add programCode to Program (auto-generate from existing IDs)
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "programCode" TEXT;
UPDATE "Program" SET "programCode" = 'PRG-' || LPAD(CAST(id AS TEXT), 3, '0') WHERE "programCode" IS NULL;
ALTER TABLE "Program" ALTER COLUMN "programCode" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Program_programCode_key" ON "Program"("programCode");

-- 2. Drop teacherId from Program (replaced by TeacherProgram junction)
ALTER TABLE "Program" DROP COLUMN IF EXISTS "teacherId";

-- 3. Create TeacherProgram junction table
CREATE TABLE IF NOT EXISTS "TeacherProgram" (
    "id"         SERIAL       NOT NULL,
    "teacherId"  INTEGER      NOT NULL,
    "programId"  INTEGER      NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherProgram_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TeacherProgram_teacherId_programId_key" UNIQUE ("teacherId", "programId"),
    CONSTRAINT "TeacherProgram_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE,
    CONSTRAINT "TeacherProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE
);

-- 4. Create StudentProgram junction table
CREATE TABLE IF NOT EXISTS "StudentProgram" (
    "id"        SERIAL       NOT NULL,
    "studentId" INTEGER      NOT NULL,
    "programId" INTEGER      NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN      NOT NULL DEFAULT false,
    CONSTRAINT "StudentProgram_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StudentProgram_studentId_programId_key" UNIQUE ("studentId", "programId"),
    CONSTRAINT "StudentProgram_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE,
    CONSTRAINT "StudentProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE
);

-- 5. Backfill StudentProgram from Student.program (existing students → their current program)
INSERT INTO "StudentProgram" ("studentId", "programId", "isPrimary")
SELECT s.id, p.id, true
FROM "Student" s
JOIN "Program" p ON p.slug = s.program
ON CONFLICT DO NOTHING;

-- 6. Add programId FK to Course
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "programId" INTEGER;
ALTER TABLE "Course" DROP CONSTRAINT IF EXISTS "Course_programId_fkey";
ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL;

-- 7. Backfill Course.programId from Course.program slug
UPDATE "Course" c
SET "programId" = p.id
FROM "Program" p
WHERE p.slug = c.program AND c."programId" IS NULL;

-- 8. Create Exercise table
CREATE TABLE IF NOT EXISTS "Exercise" (
    "id"          SERIAL       NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT         NOT NULL,
    "courseId"    INTEGER      NOT NULL,
    "teacherId"   INTEGER      NOT NULL,
    "dueDate"     TIMESTAMP(3),
    "maxScore"    DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Exercise_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE
);

-- 9. Create ExerciseSubmission table
CREATE TABLE IF NOT EXISTS "ExerciseSubmission" (
    "id"          SERIAL       NOT NULL,
    "exerciseId"  INTEGER      NOT NULL,
    "studentId"   INTEGER      NOT NULL,
    "content"     TEXT,
    "score"       DOUBLE PRECISION,
    "feedback"    TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt"    TIMESTAMP(3),
    "status"      TEXT         NOT NULL DEFAULT 'pending',
    CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ExerciseSubmission_exerciseId_studentId_key" UNIQUE ("exerciseId", "studentId"),
    CONSTRAINT "ExerciseSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE,
    CONSTRAINT "ExerciseSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE
);
