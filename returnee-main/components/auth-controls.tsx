"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type MeResponse = {
  user: {
    email: string;
    role: "resident" | "courier" | "admin";
    name: string;
  } | null;
};

export function AuthControls() {
  const [user, setUser] = useState<MeResponse["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as MeResponse;
        setUser(payload.user);
      } finally {
        setIsLoading(false);
      }
    }
    void loadUser();
  }, []);

  async function logout() {
    await signOut({ callbackUrl: "/login" });
  }

  if (isLoading) {
    return <span className="auth-loading muted">Loading account...</span>;
  }

  if (!user) {
    return (
      <Link className="btn btn-secondary btn-small auth-login" href="/login">
        Log in
      </Link>
    );
  }

  return (
    <div className="auth-controls">
      <div className="auth-identity">
        <span className="muted auth-role">{user.role}</span>
        <span className="auth-name">{user.name}</span>
      </div>
      <button className="btn btn-secondary btn-small" onClick={() => void logout()} type="button">
        Log out
      </button>
    </div>
  );
}
