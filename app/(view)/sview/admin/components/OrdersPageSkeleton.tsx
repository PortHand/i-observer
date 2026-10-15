import { statusTabs } from "../content/adminContent";
import OrderCardsSkeleton from "./OrderCardsSkeleton";

/** The order list page's shape while it first loads: header, tabs and placeholder cards. */
export default function OrdersPageSkeleton() {
  return (
    <div className="admin-page" aria-hidden="true">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="skeleton skeleton--line skeleton--small" style={{ width: "90px" }} />
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--line" style={{ width: "420px", maxWidth: "100%" }} />
        </div>
        <span className="skeleton skeleton--search" />
      </header>
      <section className="order-list">
        <nav className="status-tabs">
          {statusTabs.map((tab) => (
            <span key={tab.id} className="status-tabs__tab">
              {tab.label}
            </span>
          ))}
        </nav>
        <OrderCardsSkeleton />
      </section>
    </div>
  );
}
