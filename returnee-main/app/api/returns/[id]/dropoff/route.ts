import { NextResponse } from "next/server";

import { requireSessionRole } from "@/lib/access";
import { markInBinOrThrow } from "@/lib/returns-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionRole(["resident", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const item = await markInBinOrThrow(id, auth.session);
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark return in bin";
    const status =
      message === "Return not found"
        ? 404
        : message.includes("not eligible")
          ? 400
          : message.includes("do not have access")
            ? 403
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
