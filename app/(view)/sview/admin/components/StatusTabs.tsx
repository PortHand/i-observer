import { list, statusTabs } from "../content/adminContent";
import type { AdminOrderPage, StatusFilter } from "../services/adminService";

interface StatusTabsProps {
  current: StatusFilter;
  /** Per status, matching the current search (which switching keeps). */
  counts: AdminOrderPage["counts"];
  onSelect: (status: StatusFilter) => void;
}

/** One tab per status with its count. Switching changes the list in place. */
export default function StatusTabs({ current, counts, onSelect }: StatusTabsProps) {
  return (
    <nav className="status-tabs" aria-label={list.tabsLabel}>
      {statusTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="status-tabs__tab"
          aria-current={tab.id === current ? "page" : undefined}
          onClick={() => tab.id !== current && onSelect(tab.id)}
        >
          {tab.label}
          <span className={`status-tabs__count${tab.id === "submitted" && counts.submitted > 0 ? " status-tabs__count--attention" : ""}`}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </nav>
  );
}
