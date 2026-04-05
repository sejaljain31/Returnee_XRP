import { NextResponse } from "next/server";

import { requireSessionRole } from "@/lib/access";
import { createReturn, fetchReturns } from "@/lib/returns-service";

export async function GET() {
  const auth = await requireSessionRole(["resident", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const items = await fetchReturns(auth.session);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const auth = await requireSessionRole(["resident", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      residentName?: string;
      apartmentAddress?: string;
      merchant?: string;
      returnQrCode?: string;
      amountXrp?: number;
    };

    if (
      !body.residentName
      || !body.apartmentAddress
      || !body.merchant
      || !body.returnQrCode
      || !body.amountXrp
      || body.amountXrp <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "resident name, apartment address, merchant, return QR code, and refund amount are required",
        },
        { status: 400 },
      );
    }

    const created = await createReturn(
      {
        residentName: body.residentName.trim(),
        apartmentAddress: body.apartmentAddress.trim(),
        merchant: body.merchant.trim(),
        returnQrCode: body.returnQrCode.trim(),
        amountXrp: body.amountXrp,
      },
      auth.session,
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create return";
    const status = message === "Return QR code is already in use" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
