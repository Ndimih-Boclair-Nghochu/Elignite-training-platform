ALTER TABLE "Enrollment" ADD COLUMN "publicAccessToken" TEXT;
CREATE UNIQUE INDEX "Enrollment_publicAccessToken_key" ON "Enrollment"("publicAccessToken");
