-- CreateSequence
CREATE SEQUENCE "destination_tag_seq" START WITH 10001 INCREMENT BY 1 MINVALUE 10001 NO MAXVALUE CACHE 1;

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('CREATED', 'ESCROW_LOCKED', 'IN_BIN', 'REFUND_RELEASED');

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "resident_name" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount_xrp" DOUBLE PRECISION NOT NULL,
    "destination_tag" INTEGER NOT NULL,
    "status" "ReturnStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "escrow_condition" TEXT NOT NULL,
    "escrow_create_tx_hash" TEXT NOT NULL,
    "escrow_finish_tx_hash" TEXT,
    "escrow_fulfillment_secret" TEXT NOT NULL,
    "escrow_offer_sequence" INTEGER NOT NULL,
    "escrow_is_released" BOOLEAN NOT NULL,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "returns_destination_tag_key" ON "returns"("destination_tag");

-- CreateIndex
CREATE INDEX "returns_owner_email_idx" ON "returns"("owner_email");
