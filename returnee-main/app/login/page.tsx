"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onGoogleSignIn() {
    setError("");
    setIsSubmitting(true);
    try {
      // Always land on home after OAuth so role workspaces (/admin, /courier, /dashboard)
      // are never opened automatically (including when /login?next=/admin from middleware).
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell page-enter">
      <div className="login-layout">
        <section className="login-intro">
          <p className="eyebrow">Secure access</p>
          <h1 className="display-title login-title">Sign in.</h1>
          <p className="hero-subtitle">Access your workspace.</p>
          <div className="login-visual" aria-hidden="true">
            <div className="package-graphic package-graphic-small">
              <div className="package-shadow" />
              <div className="package-box">
                <div className="package-face package-top" />
                <div className="package-face package-front">
                  <span className="package-sticker">Returnee</span>
                </div>
                <div className="package-face package-side" />
                <div className="package-tape package-tape-top" />
                <div className="package-tape package-tape-front" />
              </div>
            </div>
          </div>
        </section>

        <section className="panel login-card stack">
          <div className="section-head">
            <div>
              <p className="section-label">Authentication</p>
              <h2 className="section-title">Continue</h2>
            </div>
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button
            className="btn btn-primary btn-block"
            type="button"
            disabled={isSubmitting}
            onClick={() => void onGoogleSignIn()}
          >
            {isSubmitting ? "Redirecting..." : "Continue with Google"}
          </button>
          <div className="panel panel-quiet demo-creds">
            <p className="section-label">Role mapping</p>
            <p className="muted">
              Access is role-based. Your workspace changes based on your account.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
