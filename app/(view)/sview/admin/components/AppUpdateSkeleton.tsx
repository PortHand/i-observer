/** The Force update page's shape while it first loads. */
export default function AppUpdateSkeleton() {
  return (
    <div className="admin-page" aria-hidden="true">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="skeleton skeleton--line skeleton--small" style={{ width: "90px" }} />
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--line" style={{ width: "420px", maxWidth: "100%" }} />
        </div>
      </header>
      <section className="card app-update">
        <span className="skeleton skeleton--line" style={{ width: "60%" }} />
        <span className="skeleton skeleton--line" style={{ width: "40%" }} />
        <span className="skeleton skeleton--line" style={{ width: "80%" }} />
      </section>
    </div>
  );
}
