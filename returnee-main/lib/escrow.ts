import { randomBytes } from "crypto";
import PreimageSha256 from "five-bells-condition/src/types/preimage-sha256";
import TypeRegistry from "five-bells-condition/src/lib/type-registry";

let isRegistered = false;

export function createEscrowSecret(): { fulfillmentSecret: string; condition: string } {
  if (!isRegistered) {
    TypeRegistry.registerType(PreimageSha256);
    isRegistered = true;
  }

  const preimage = randomBytes(32);
  const fulfillment = new PreimageSha256();

  fulfillment.setPreimage(preimage);

  const fulfillmentSecret = fulfillment.serializeBinary().toString("hex").toUpperCase();
  const condition = fulfillment.getConditionBinary().toString("hex").toUpperCase();
  return { fulfillmentSecret, condition };
}
