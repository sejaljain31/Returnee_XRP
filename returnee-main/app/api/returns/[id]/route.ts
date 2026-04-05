import { NextResponse } from "next/server";

import { requireSessionRole } from "@/lib/access";
import { deleteReturnOrThrow, fetchReturnOrThrow } from "@/lib/returns-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionRole(["resident", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const item = await fetchReturnOrThrow(id, auth.session);
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch return";
    const status =
      message === "Return not found"
        ? 404
        : message.includes("do not have access")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionRole(["resident", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    await deleteReturnOrThrow(id, auth.session);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete return";
    const status =
      message === "Return not found"
        ? 404
        : message.includes("do not have access")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
