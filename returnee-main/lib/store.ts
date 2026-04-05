import { Prisma, type ReturneeReturn, type ReturnStatus as PrismaReturnStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PublicReturnRecord, ReturnRecord, ReturnStatus } from "@/lib/types";

function rowToRecord(row: ReturneeReturn): ReturnRecord {
  return {
    id: row.id,
    ownerEmail: row.ownerEmail,
    residentName: row.residentName,
    apartmentAddress: row.apartmentAddress,
    merchant: row.merchant,
    returnQrCode: row.returnQrCode,
    amountXrp: row.amountXrp,
    destinationTag: row.destinationTag,
    status: row.status as ReturnStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    escrow: {
      condition: row.escrowCondition,
      createTxHash: row.escrowCreateTxHash,
      finishTxHash: row.escrowFinishTxHash,
      fulfillmentSecret: row.escrowFulfillmentSecret,
      offerSequence: row.escrowOfferSequence,
      isReleased: row.escrowIsReleased,
    },
  };
}

function recordToCreateInput(record: ReturnRecord) {
  return {
    id: record.id,
    ownerEmail: record.ownerEmail,
    residentName: record.residentName,
    apartmentAddress: record.apartmentAddress,
    merchant: record.merchant,
    returnQrCode: record.returnQrCode,
    amountXrp: record.amountXrp,
    destinationTag: record.destinationTag,
    status: record.status as PrismaReturnStatus,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    escrowCondition: record.escrow.condition,
    escrowCreateTxHash: record.escrow.createTxHash,
    escrowFinishTxHash: record.escrow.finishTxHash,
    escrowFulfillmentSecret: record.escrow.fulfillmentSecret,
    escrowOfferSequence: record.escrow.offerSequence,
    escrowIsReleased: record.escrow.isReleased,
  };
}

export async function nextDestinationTag(): Promise<number> {
  const rows = await prisma.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('destination_tag_seq') AS nextval
  `;
  const value = rows[0]?.nextval;
  if (value === undefined) {
    throw new Error("Failed to allocate destination tag");
  }
  return Number(value);
}

export async function listReturns(): Promise<ReturnRecord[]> {
  const rows = await prisma.returneeReturn.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToRecord);
}

export async function listReturnsInBin(): Promise<ReturnRecord[]> {
  const rows = await prisma.returneeReturn.findMany({
    where: {
      status: {
        in: ["IN_BIN", "PICKED_UP"],
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToRecord);
}

export async function getReturnByDestinationTag(
  destinationTag: number,
): Promise<ReturnRecord | undefined> {
  const row = await prisma.returneeReturn.findUnique({ where: { destinationTag } });
  return row ? rowToRecord(row) : undefined;
}

export async function getReturnByQrCode(returnQrCode: string): Promise<ReturnRecord | undefined> {
  const row = await prisma.returneeReturn.findFirst({
    where: {
      returnQrCode: {
        equals: returnQrCode,
        mode: "insensitive",
      },
    },
  });
  return row ? rowToRecord(row) : undefined;
}

export async function getReturnById(id: string): Promise<ReturnRecord | undefined> {
  const row = await prisma.returneeReturn.findUnique({ where: { id } });
  return row ? rowToRecord(row) : undefined;
}

export async function saveReturn(record: ReturnRecord): Promise<ReturnRecord> {
  const data = recordToCreateInput(record);
  await prisma.returneeReturn.upsert({
    where: { id: record.id },
    create: data,
    update: {
      ownerEmail: data.ownerEmail,
      residentName: data.residentName,
      apartmentAddress: data.apartmentAddress,
      merchant: data.merchant,
      returnQrCode: data.returnQrCode,
      amountXrp: data.amountXrp,
      destinationTag: data.destinationTag,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      escrowCondition: data.escrowCondition,
      escrowCreateTxHash: data.escrowCreateTxHash,
      escrowFinishTxHash: data.escrowFinishTxHash,
      escrowFulfillmentSecret: data.escrowFulfillmentSecret,
      escrowOfferSequence: data.escrowOfferSequence,
      escrowIsReleased: data.escrowIsReleased,
    },
  });
  return record;
}

export async function deleteReturnById(id: string): Promise<void> {
  try {
    await prisma.returneeReturn.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new Error("Return not found");
    }
    throw error;
  }
}

export function toPublicReturn(record: ReturnRecord): PublicReturnRecord {
  const { fulfillmentSecret, ...safeEscrow } = record.escrow;
  const { ownerEmail, ...safeRecord } = record;
  void fulfillmentSecret;
  void ownerEmail;
  return {
    ...safeRecord,
    escrow: safeEscrow,
  };
}
