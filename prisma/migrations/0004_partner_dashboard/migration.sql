ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'student';

CREATE TABLE "SchoolPartnerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "institutionName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "website" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "description" TEXT,
    "accreditationInfo" TEXT,
    "verificationDocuments" JSONB,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchoolPartnerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerProgram" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "degreeType" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tuitionFee" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "intakeDates" TEXT,
    "admissionRequirements" TEXT,
    "requiredDocuments" TEXT,
    "languageRequirements" TEXT,
    "applicationDeadline" TIMESTAMP(3),
    "availableSeats" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartnerProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerApplication" (
    "id" SERIAL NOT NULL,
    "partnerProgramId" INTEGER NOT NULL,
    "studentUserId" INTEGER,
    "applicantFullName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantPhone" TEXT,
    "applicantCountry" TEXT,
    "studentProfileSummary" TEXT,
    "submittedDocuments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestMessage" TEXT,
    "partnerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartnerApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolPartnerProfile_userId_key" ON "SchoolPartnerProfile"("userId");
CREATE UNIQUE INDEX "PartnerProgram_slug_key" ON "PartnerProgram"("slug");

ALTER TABLE "SchoolPartnerProfile"
ADD CONSTRAINT "SchoolPartnerProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PartnerProgram"
ADD CONSTRAINT "PartnerProgram_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "SchoolPartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PartnerApplication"
ADD CONSTRAINT "PartnerApplication_partnerProgramId_fkey"
FOREIGN KEY ("partnerProgramId") REFERENCES "PartnerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
