import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  const canResidentFlow = role === "resident" || role === "admin";
  const canCourierFlow = role === "courier" || role === "admin";

  return (
    <div className="landing-page page-enter">
      <section className="landing-hero">
        <div className="page-shell landing-grid">
          <div className="hero-copy">
            <p className="eyebrow">Returnee</p>
            <h1 className="display-title">Returns, simplified.</h1>
            <p className="hero-subtitle">Drop. Verify. Release.</p>
            <p className="hero-body muted">Built for premium apartment buildings.</p>

            {!session && (
              <div className="actions hero-actions">
                <Link className="btn btn-primary" href="/login">
                  Sign in to get started
                </Link>
              </div>
            )}

            {session && (
              <>
                <p className="section-label">Choose a workspace</p>
                <div className="actions hero-actions">
                  {canResidentFlow && (
                    <Link className="btn btn-primary" href="/dashboard">
                      Start Return
                    </Link>
                  )}
                  {canCourierFlow && (
                    <Link className="btn btn-secondary" href="/courier">
                      Open Courier Console
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="package-graphic">
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
        </div>
      </section>

      <section className="page-shell landing-support">
        <div className="apple-stack">
          <article className="panel panel-quiet apple-panel">
            <p className="section-label">Verified</p>
            <h2 className="section-title">Refunds release after merchant scan.</h2>
          </article>
          <article className="panel panel-quiet apple-panel">
            <p className="section-label">Seamless</p>
            <h2 className="section-title">No crypto learning curve.</h2>
          </article>
          <article className="panel panel-quiet apple-panel">
            <p className="section-label">Connected</p>
            <h2 className="section-title">One tracked flow across every handoff.</h2>
          </article>
        </div>
      </section>

      {session && (
        <section className="page-shell">
          <div className="panel">
            <div className="section-head">
              <div>
                <p className="section-label">Workspace selection</p>
                <h2 className="section-title">Continue.</h2>
              </div>
            </div>
            <div className="actions">
              {canResidentFlow && (
                <Link className="btn btn-primary" href="/dashboard">
                  Go to resident dashboard
                </Link>
              )}
              {canCourierFlow && (
                <Link className="btn btn-secondary" href="/courier">
                  Open courier workspace
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
