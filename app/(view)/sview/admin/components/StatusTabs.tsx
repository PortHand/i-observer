import Link from "next/link";
import { list, statusTabs } from "../content/adminContent";
import { ordersLink, type ListQuery } from "../helper/adminHelper";
import type { AdminOrderPage } from "../services/adminService";

/** One tab per status with its count (matching the search, which the tabs keep). */
export default function StatusTabs({ query, counts }: { query: ListQuery; counts: AdminOrderPage["counts"] }) {
  return (
    <nav className="status-tabs" aria-label={list.tabsLabel}>
      {statusTabs.map((tab) => (
        <Link
          key={tab.id}
          className="status-tabs__tab"
          href={ordersLink({ status: tab.id, search: query.search })}
          aria-current={tab.id === query.status ? "page" : undefined}
        >
          {tab.label}
          <span className={`status-tabs__count${tab.id === "submitted" && counts.submitted > 0 ? " status-tabs__count--attention" : ""}`}>
            {counts[tab.id]}
          </span>
        </Link>
      ))}
    </nav>
  );
}
