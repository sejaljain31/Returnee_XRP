import { randomUUID } from "crypto";

import type { AuthActor } from "@/lib/auth";
import { createEscrowSecret } from "@/lib/escrow";
import {
  deleteReturnById,
  getReturnById,
  getReturnByQrCode,
  listReturns,
  listReturnsInBin,
  nextDestinationTag,
  saveReturn,
  toPublicReturn,
} from "@/lib/store";
import type { PublicReturnRecord, ReturnRecord } from "@/lib/types";
import { createConditionalEscrowTx, finishConditionalEscrowTx } from "@/lib/xrpl";

export type CreateReturnInput = {
  residentName: string;
  apartmentAddress: string;
  merchant: string;
  returnQrCode: string;
  amountXrp: number;
};

const ESCROW_LOCK_AMOUNT_XRP = 0.1;

function canAccessReturn(record: ReturnRecord, actor: AuthActor): boolean {
  return actor.role === "admin" || record.ownerEmail === actor.email;
}

export async function createReturn(
  input: CreateReturnInput,
  owner: AuthActor,
): Promise<PublicReturnRecord> {
  const existingByQrCode = await getReturnByQrCode(input.returnQrCode);
  if (existingByQrCode) {
    throw new Error("Return QR code is already in use");
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const destinationTag = await nextDestinationTag();
  const { condition, fulfillmentSecret } = createEscrowSecret();
  const escrowCreate = await createConditionalEscrowTx({
    destinationTag,
    amountXrp: ESCROW_LOCK_AMOUNT_XRP,
    condition,
    returnId: id,
  });

  const record: ReturnRecord = {
    id,
    ownerEmail: owner.email,
    residentName: input.residentName,
    apartmentAddress: input.apartmentAddress,
    merchant: input.merchant,
    returnQrCode: input.returnQrCode,
    amountXrp: input.amountXrp,
    destinationTag,
    status: "ESCROW_LOCKED",
    createdAt: now,
    updatedAt: now,
    escrow: {
      condition,
      createTxHash: escrowCreate.txHash,
      finishTxHash: null,
      fulfillmentSecret,
      isReleased: false,
      offerSequence: escrowCreate.offerSequence,
    },
  };

  await saveReturn(record);
  return toPublicReturn(record);
}

export async function fetchReturns(viewer: AuthActor): Promise<PublicReturnRecord[]> {
  if (viewer.role === "admin") {
    const rows = await listReturns();
    return rows.map(toPublicReturn);
  }
  if (viewer.role === "courier") {
    return [];
  }
  const rows = await listReturns();
  return rows.filter((record) => record.ownerEmail === viewer.email).map(toPublicReturn);
}

export async function fetchReturnOrThrow(
  id: string,
  viewer: AuthActor,
): Promise<PublicReturnRecord> {
  const record = await getReturnById(id);
  if (!record) {
    throw new Error("Return not found");
  }
  if (!canAccessReturn(record, viewer)) {
    throw new Error("You do not have access to this return");
  }
  return toPublicReturn(record);
}

export async function markInBinOrThrow(
  id: string,
  viewer: AuthActor,
): Promise<PublicReturnRecord> {
  const record = await getReturnById(id);
  if (!record) {
    throw new Error("Return not found");
  }
  if (!canAccessReturn(record, viewer)) {
    throw new Error("You do not have access to this return");
  }
  if (record.status !== "ESCROW_LOCKED" && record.status !== "CREATED") {
    throw new Error("Return is not eligible for drop-off");
  }

  record.status = "IN_BIN";
  record.updatedAt = new Date().toISOString();
  await saveReturn(record);
  return toPublicReturn(record);
}

export async function deleteReturnOrThrow(id: string, viewer: AuthActor): Promise<void> {
  const record = await getReturnById(id);
  if (!record) {
    throw new Error("Return not found");
  }
  if (!canAccessReturn(record, viewer)) {
    throw new Error("You do not have access to this return");
  }
  await deleteReturnById(id);
}

export async function confirmPickupOrThrow(
  id: string,
  actor: AuthActor,
): Promise<PublicReturnRecord> {
  if (actor.role !== "courier" && actor.role !== "admin") {
    throw new Error("You do not have access to this action");
  }
  const record = await getReturnById(id);
  if (!record) {
    throw new Error("Return not found");
  }
  if (record.status !== "IN_BIN") {
    throw new Error("Return is not ready for pickup");
  }
  if (record.escrow.isReleased) {
    throw new Error("Escrow already released");
  }
  record.status = "PICKED_UP";
  record.updatedAt = new Date().toISOString();

  await saveReturn(record);
  return toPublicReturn(record);
}

export async function fetchMerchantReturnOrThrow(returnQrCode: string): Promise<PublicReturnRecord> {
  const record = await getReturnByQrCode(returnQrCode);
  if (!record) {
    throw new Error("Return not found");
  }
  return toPublicReturn(record);
}

export async function confirmMerchantScanOrThrow(
  returnQrCode: string,
): Promise<PublicReturnRecord> {
  const record = await getReturnByQrCode(returnQrCode);
  if (!record) {
    throw new Error("Return not found");
  }
  if (record.status !== "PICKED_UP") {
    throw new Error("Return is not ready for merchant confirmation");
  }
  if (record.returnQrCode.trim().toLowerCase() !== returnQrCode.trim().toLowerCase()) {
    throw new Error("QR code does not match this return");
  }
  if (record.escrow.isReleased) {
    throw new Error("Escrow already released");
  }

  const finished = await finishConditionalEscrowTx({
    condition: record.escrow.condition,
    fulfillmentSecret: record.escrow.fulfillmentSecret,
    returnId: record.id,
    offerSequence: record.escrow.offerSequence,
  });

  record.status = "REFUND_RELEASED";
  record.updatedAt = new Date().toISOString();
  record.escrow.isReleased = true;
  record.escrow.finishTxHash = finished.txHash;

  await saveReturn(record);
  return toPublicReturn(record);
}

export async function listCourierQueue(actor: AuthActor): Promise<PublicReturnRecord[]> {
  if (actor.role !== "courier" && actor.role !== "admin") {
    throw new Error("You do not have access to this action");
  }
  const rows = await listReturnsInBin();
  return rows.map(toPublicReturn);
}
