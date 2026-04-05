import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: "resident" | "courier" | "admin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "resident" | "courier" | "admin";
  }
}

