import "server-only";

import { createHash } from "crypto";

type EscrowCreateInput = {
  destinationTag: number;
  amountXrp: number;
  condition: string;
  returnId: string;
};

type EscrowFinishInput = {
  condition: string;
  fulfillmentSecret: string;
  returnId: string;
  offerSequence: number;
};

function pseudoHash(label: string, value: string): string {
  return createHash("sha256").update(`${label}:${value}`).digest("hex");
}

function getConfig() {
  return {
    url: process.env.XRPL_SERVER_URL,
    seed: process.env.XRPL_WALLET_SEED,
    destination: process.env.XRPL_DESTINATION_ADDRESS,
  };
}

async function loadXrpl() {
  // Force ws to stay on its pure-JS path. This avoids optional native-module
  // incompatibilities that can break testnet connections in local demos.
  process.env.WS_NO_BUFFER_UTIL = "1";
  return import("xrpl");
}

function toRippleTime(date: Date): number {
  const rippleEpochOffsetSeconds = 946684800;
  return Math.floor(date.getTime() / 1000) - rippleEpochOffsetSeconds;
}

export async function createConditionalEscrowTx(
  input: EscrowCreateInput,
): Promise<{ txHash: string; offerSequence: number }> {
  const config = getConfig();
  if (!config.url || !config.seed || !config.destination) {
    return {
      txHash: `sim_${pseudoHash("escrow_create", `${input.returnId}:${input.condition}`).slice(0, 24)}`,
      offerSequence: 1,
    };
  }

  const { Client, Wallet } = await loadXrpl();
  const client = new Client(config.url);
  await client.connect();

  try {
    const wallet = Wallet.fromSeed(config.seed);
    const cancelAfter = toRippleTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const prepared = await client.autofill({
      TransactionType: "EscrowCreate",
      Account: wallet.address,
      Amount: String(Math.round(input.amountXrp * 1_000_000)),
      Destination: config.destination,
      DestinationTag: input.destinationTag,
      Condition: input.condition.toUpperCase(),
      CancelAfter: cancelAfter,
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(`return:${input.returnId}`).toString("hex").toUpperCase(),
          },
        },
      ],
    });
    const signed = wallet.sign(prepared);
    const response = await client.submitAndWait(signed.tx_blob);
    return {
      txHash: String(response.result.hash ?? signed.hash),
      offerSequence: Number((prepared as { Sequence?: number }).Sequence ?? 1),
    };
  } finally {
    await client.disconnect();
  }
}

export async function finishConditionalEscrowTx(
  input: EscrowFinishInput,
): Promise<{ txHash: string }> {
  const config = getConfig();
  if (!config.url || !config.seed || !config.destination) {
    return {
      txHash: `sim_${pseudoHash("escrow_finish", `${input.returnId}:${input.fulfillmentSecret}`).slice(0, 24)}`,
    };
  }

  const { Client, Wallet } = await loadXrpl();
  const client = new Client(config.url);
  await client.connect();

  try {
    const wallet = Wallet.fromSeed(config.seed);
    const prepared = await client.autofill({
      TransactionType: "EscrowFinish",
      Account: wallet.address,
      Owner: wallet.address,
      OfferSequence: input.offerSequence,
      Condition: input.condition.toUpperCase(),
      Fulfillment: input.fulfillmentSecret.toUpperCase(),
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(`return:${input.returnId}`).toString("hex").toUpperCase(),
          },
        },
      ],
    });
    const signed = wallet.sign(prepared);
    const response = await client.submitAndWait(signed.tx_blob);
    return {
      txHash: String(response.result.hash ?? signed.hash),
    };
  } finally {
    await client.disconnect();
  }
}
