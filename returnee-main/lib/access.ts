import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";
import type { AuthActor, UserRole } from "@/lib/auth";

export async function requireSessionRole(
  allowedRoles: UserRole[],
): Promise<{ ok: true; session: AuthActor } | { ok: false; status: number; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.role) {
    return { ok: false, status: 401, error: "Please sign in first." };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return { ok: false, status: 403, error: "You do not have access to this action." };
  }

  return {
    ok: true,
    session: {
      email: session.user.email,
      role: session.user.role,
      name: session.user.name ?? session.user.email,
    },
  };
}

