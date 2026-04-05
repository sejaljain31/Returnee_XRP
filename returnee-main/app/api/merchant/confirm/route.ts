import { NextResponse } from "next/server";

import { confirmMerchantScanOrThrow } from "@/lib/returns-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { returnQrCode?: string };
    const returnQrCode = body.returnQrCode?.trim();

    if (!returnQrCode) {
      return NextResponse.json({ error: "Return QR code is required" }, { status: 400 });
    }

    const item = await confirmMerchantScanOrThrow(returnQrCode);
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm merchant scan";
    const status =
      message === "Return not found"
        ? 404
        : message.includes("not ready") || message.includes("already released") || message.includes("does not match")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
