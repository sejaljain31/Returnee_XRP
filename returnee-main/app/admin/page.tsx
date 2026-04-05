export default function AdminPage() {
  return (
    <section className="page-shell page-stack page-enter">
      <div className="panel panel-hero">
        <p className="eyebrow">Admin</p>
        <h1 className="workspace-title">Optional view.</h1>
        <p className="workspace-copy muted">Not needed for the core MVP flow.</p>
      </div>

      <section className="panel panel-quiet">
        <p className="section-label">Current status</p>
        <h2 className="section-title">Safe to remove from navigation.</h2>
        <p className="muted">
          The real flow lives in the resident and courier views. This page can stay as a placeholder
          or be removed later.
        </p>
      </section>
    </section>
  );
}
