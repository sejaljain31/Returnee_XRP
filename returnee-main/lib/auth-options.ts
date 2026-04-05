import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { resolveRoleFromEmail } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "placeholder-google-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "placeholder-google-secret",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const origin = new URL(baseUrl).origin;
      let resolved: string;
      if (url.startsWith("/")) {
        resolved = `${baseUrl}${url}`;
      } else {
        try {
          const u = new URL(url);
          resolved = u.origin === origin ? url : baseUrl;
        } catch {
          resolved = baseUrl;
        }
      }
      let path: string;
      try {
        path = new URL(resolved).pathname;
      } catch {
        return baseUrl;
      }
      if (
        path.startsWith("/admin") ||
        path.startsWith("/courier") ||
        path.startsWith("/dashboard")
      ) {
        return `${baseUrl}/`;
      }
      return resolved;
    },
    async jwt({ token }) {
      token.role = resolveRoleFromEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "resident" | "courier" | "admin") ?? "resident";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

