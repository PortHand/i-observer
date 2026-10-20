/** A plan editor's shape while it first loads. */
export default function PlanEditorSkeleton() {
  return (
    <div className="admin-page" aria-hidden="true">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="skeleton skeleton--line skeleton--small" style={{ width: "90px" }} />
          <span className="skeleton skeleton--title" />
        </div>
      </header>
      <div className="plan-editor">
        <div className="plan-editor__main">
          {Array.from({ length: 3 }, (_, index) => (
            <section key={index} className="card plan-editor__section">
              <span className="skeleton skeleton--line" style={{ width: "30%" }} />
              <span className="skeleton skeleton--line" style={{ width: "80%" }} />
              <span className="skeleton skeleton--line" style={{ width: "60%" }} />
            </section>
          ))}
        </div>
        <section className="card plan-editor__aside">
          <span className="skeleton skeleton--line" style={{ width: "50%" }} />
          <span className="skeleton skeleton--title" />
        </section>
      </div>
    </div>
  );
}
