-- Fresh PostgreSQL migration for ELIGNITE Training Platform
-- Uses IF NOT EXISTS / exception guards so it is safe to run against an
-- already-populated Neon database (idempotent baseline).

-- ───────────────────────────── Tables ─────────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "phone" TEXT,
    "photoUrl" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Student" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "matricle" TEXT,
    "userId" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "address" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Teacher" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "matricle" TEXT,
    "userId" INTEGER NOT NULL,
    "occupation" TEXT,
    "profession" TEXT,
    "quotes" TEXT,
    "department" TEXT NOT NULL,
    "specialization" TEXT,
    "qualifications" TEXT,
    "office" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeacherProgram" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentProgram" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "programId" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StudentProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Program" (
    "id" SERIAL NOT NULL,
    "programCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tuition" DOUBLE PRECISION NOT NULL,
    "requirements" TEXT,
    "outcomes" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Course" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "program" TEXT NOT NULL,
    "programId" INTEGER,
    "level" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "teacherId" INTEGER,
    "room" TEXT,
    "schedule" TEXT,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Exercise" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ExerciseSubmission" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "content" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TEXT,
    "gender" TEXT,
    "program" TEXT NOT NULL,
    "address" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "matricle" TEXT,
    "publicAccessToken" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Result" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "ca" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exam" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'F',
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Fee" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receiptNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL DEFAULT 'all',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "author" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Certificate" (
    "id" SERIAL NOT NULL,
    "certNo" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Gallery" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AboutUs" (
    "id" SERIAL NOT NULL,
    "vision" TEXT NOT NULL,
    "visionImageUrl" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "missionImageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AboutUs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Testimony" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "submitterType" TEXT NOT NULL DEFAULT 'student',
    "name" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" INTEGER,
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Testimony_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Message" (
    "id" SERIAL NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromRole" TEXT NOT NULL DEFAULT 'student',
    "fromUserId" INTEGER,
    "toRole" TEXT NOT NULL DEFAULT 'ceo',
    "toUserId" INTEGER,
    "toProgramId" INTEGER,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Settings" (
    "id" SERIAL NOT NULL,
    "applicationsOpen" BOOLEAN NOT NULL DEFAULT true,
    "applicationYear" TEXT NOT NULL DEFAULT '2024/2025',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" INTEGER,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SchoolSettings" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "program" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "teacherId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectScore" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "submissionLink" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "gradedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Timetable" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────── Indexes ─────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "User_matricule_key" ON "User"("matricule");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_studentId_key" ON "Student"("studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_matricle_key" ON "Student"("matricle");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_userId_key" ON "Student"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_teacherId_key" ON "Teacher"("teacherId");
CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_matricle_key" ON "Teacher"("matricle");
CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_userId_key" ON "Teacher"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TeacherProgram_teacherId_programId_key" ON "TeacherProgram"("teacherId", "programId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentProgram_studentId_programId_key" ON "StudentProgram"("studentId", "programId");
CREATE UNIQUE INDEX IF NOT EXISTS "Program_programCode_key" ON "Program"("programCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Program_slug_key" ON "Program"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Course_code_key" ON "Course"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ExerciseSubmission_exerciseId_studentId_key" ON "ExerciseSubmission"("exerciseId", "studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_email_key" ON "Enrollment"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_matricle_key" ON "Enrollment"("matricle");
CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_publicAccessToken_key" ON "Enrollment"("publicAccessToken");
CREATE UNIQUE INDEX IF NOT EXISTS "Result_studentId_courseId_semester_year_key" ON "Result"("studentId", "courseId", "semester", "year");
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_studentId_courseId_date_key" ON "Attendance"("studentId", "courseId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_certNo_key" ON "Certificate"("certNo");
CREATE UNIQUE INDEX IF NOT EXISTS "Project_code_key" ON "Project"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectScore_projectId_studentId_key" ON "ProjectScore"("projectId", "studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Timetable_courseId_dayOfWeek_startTime_semester_year_key" ON "Timetable"("courseId", "dayOfWeek", "startTime", "semester", "year");

-- ─────────────────────── Foreign Keys (idempotent) ─────────────────────────
-- Uses exception handling so re-running on a populated DB is safe.

DO $$ BEGIN
  ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "TeacherProgram" ADD CONSTRAINT "TeacherProgram_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "TeacherProgram" ADD CONSTRAINT "TeacherProgram_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "StudentProgram" ADD CONSTRAINT "StudentProgram_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "StudentProgram" ADD CONSTRAINT "StudentProgram_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_exerciseId_fkey"
    FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Result" ADD CONSTRAINT "Result_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Fee" ADD CONSTRAINT "Fee_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ProjectScore" ADD CONSTRAINT "ProjectScore_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ProjectScore" ADD CONSTRAINT "ProjectScore_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
