declare module "five-bells-condition/src/types/preimage-sha256" {
  export default class PreimageSha256 {
    static TYPE_ID: number;
    static TYPE_NAME: string;
    static TYPE_ASN1_CONDITION: string;
    static TYPE_ASN1_FULFILLMENT: string;
    setPreimage(preimage: Buffer): void;
    serializeBinary(): Buffer;
    getConditionBinary(): Buffer;
  }
}

declare module "five-bells-condition/src/lib/type-registry" {
  export default class TypeRegistry {
    static registerType(Class: unknown): void;
  }
}
