import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import type { UserRole } from "@/lib/auth";

type AccessRule = {
  match: (pathname: string) => boolean;
  roles: UserRole[];
};

const pageRules: AccessRule[] = [
  { match: (pathname) => pathname.startsWith("/admin"), roles: ["admin"] },
  { match: (pathname) => pathname.startsWith("/courier"), roles: ["courier", "admin"] },
  { match: (pathname) => pathname.startsWith("/dashboard"), roles: ["resident", "admin"] },
  { match: (pathname) => pathname.startsWith("/returns/"), roles: ["resident", "admin"] },
];

const apiRules: AccessRule[] = [
  { match: (pathname) => pathname.endsWith("/pickup"), roles: ["courier", "admin"] },
  { match: (pathname) => pathname.startsWith("/api/courier"), roles: ["courier", "admin"] },
  { match: (pathname) => pathname.startsWith("/api/returns"), roles: ["resident", "admin"] },
];

function getRequiredRoles(pathname: string): UserRole[] | null {
  if (pathname.startsWith("/api/auth")) return null;
  const source = pathname.startsWith("/api/") ? apiRules : pageRules;
  return source.find((rule) => rule.match(pathname))?.roles ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const role = (token?.role as UserRole | undefined) ?? null;
  const requiredRoles = getRequiredRoles(pathname);

  if (pathname === "/login" && role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!requiredRoles) {
    return NextResponse.next();
  }

  if (!role) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!requiredRoles.includes(role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "You do not have access to this action." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

