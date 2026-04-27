-- Add submissionLink to ProjectScore
ALTER TABLE "ProjectScore" ADD COLUMN IF NOT EXISTS "submissionLink" TEXT;

-- Add direct-messaging fields to Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fromUserId"  INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toUserId"    INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toProgramId" INTEGER;
