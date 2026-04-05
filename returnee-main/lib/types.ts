export type ReturnStatus =
  | "CREATED"
  | "ESCROW_LOCKED"
  | "IN_BIN"
  | "PICKED_UP"
  | "REFUND_RELEASED";

export interface ReturnRecord {
  id: string;
  ownerEmail: string;
  residentName: string;
  apartmentAddress: string;
  merchant: string;
  returnQrCode: string;
  amountXrp: number;
  destinationTag: number;
  status: ReturnStatus;
  createdAt: string;
  updatedAt: string;
  escrow: {
    condition: string;
    createTxHash: string;
    finishTxHash: string | null;
    fulfillmentSecret: string;
    offerSequence: number;
    isReleased: boolean;
  };
}

export interface PublicReturnRecord extends Omit<ReturnRecord, "escrow" | "ownerEmail"> {
  escrow: Omit<ReturnRecord["escrow"], "fulfillmentSecret">;
}
