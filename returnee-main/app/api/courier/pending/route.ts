import { NextResponse } from "next/server";

import { requireSessionRole } from "@/lib/access";
import { listCourierQueue } from "@/lib/returns-service";

export async function GET() {
  const auth = await requireSessionRole(["courier", "admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const items = await listCourierQueue(auth.session);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load courier queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
