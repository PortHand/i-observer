import Link from "next/link";
import { statusTabs } from "../content/adminContent";
import { ordersLink, type ListQuery } from "../helper/adminHelper";
import type { AdminOrderPage } from "../services/adminService";

/** One tab per status with its count. Switching keeps the search and goes back to page 1. */
export default function StatusTabs({ query, counts }: { query: ListQuery; counts: AdminOrderPage["counts"] }) {
  return (
    <nav className="admin-tabs mono" aria-label="Order status">
      {statusTabs.map((tab) => (
        <Link
          key={tab.id}
          href={ordersLink({ status: tab.id, search: query.search })}
          className="admin-tabs__tab"
          aria-current={tab.id === query.status ? "page" : undefined}
        >
          {tab.label}
          <span className="admin-tabs__count">{counts[tab.id]}</span>
        </Link>
      ))}
    </nav>
  );
}
