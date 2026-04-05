import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import { AuthControls } from "@/components/auth-controls";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Returnee MVP",
  description: "One-app Returnee prototype built on Next.js",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <html lang="en" className={bodyFont.variable}>
      <body>
        <div className="site-frame">
          <div className="site-noise" aria-hidden="true" />
          <div className="site-beam site-beam-left" aria-hidden="true" />
          <div className="site-beam site-beam-right" aria-hidden="true" />
        </div>
        <header className="navbar">
          <div className="page-shell nav-content">
            <Link className="logo" href="/">
              <span className="logo-mark" aria-hidden="true" />
              <span className="logo-copy">
                <span className="logo-name">Returnee</span>
                <span className="logo-tag">Verified building returns</span>
              </span>
            </Link>
            <nav className="nav-links">
              {(role === "resident" || role === "admin") && (
                <Link className="nav-link" href="/dashboard">
                  Dashboard
                </Link>
              )}
              {(role === "courier" || role === "admin") && (
                <Link className="nav-link" href="/courier">
                  Courier
                </Link>
              )}
              <AuthControls />
            </nav>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
