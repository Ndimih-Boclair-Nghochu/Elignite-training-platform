-- Add missing nullable columns to Message table that exist in Prisma schema but not in the baseline migration
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "fromUserId"  INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toUserId"    INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "toProgramId" INTEGER;
