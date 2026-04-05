import { NextResponse } from "next/server";

import { requireSessionRole } from "@/lib/access";
import { confirmPickupOrThrow } from "@/lib/returns-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionRole(["courier", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const item = await confirmPickupOrThrow(id, auth.session);
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm pickup";
    const status =
      message === "Return not found"
        ? 404
        : message.includes("not ready") || message.includes("already released")
          ? 400
          : message.includes("do not have access")
            ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
