-- AlterEnum
ALTER TYPE "ReturnStatus" ADD VALUE IF NOT EXISTS 'PICKED_UP';

-- AlterTable
ALTER TABLE "returns"
ADD COLUMN "apartment_address" TEXT NOT NULL DEFAULT '',
ADD COLUMN "return_qr_code" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "returns_return_qr_code_idx" ON "returns"("return_qr_code");
