export type UserRole = "resident" | "courier" | "admin";

export type AuthActor = {
  email: string;
  role: UserRole;
  name: string;
};

function parseEmailList(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveRoleFromEmail(email?: string | null): UserRole {
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  const adminEmails = parseEmailList(process.env.ADMIN_EMAILS);
  const courierEmails = parseEmailList(process.env.COURIER_EMAILS);

  if (normalizedEmail && adminEmails.has(normalizedEmail)) return "admin";
  if (normalizedEmail && courierEmails.has(normalizedEmail)) return "courier";
  return "resident";
}
