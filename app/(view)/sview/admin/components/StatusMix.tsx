import Link from "next/link";
import type { CSSProperties } from "react";
import { dashboard, statusTabs } from "../content/adminContent";
import { formatPercent, orderCount, ordersLink } from "../helper/adminHelper";
import type { AdminDashboard, OrderStatus } from "../services/adminService";

/** Every order by status: one stacked bar, then a row per status (label, count, share) linking to its list. */
export default function StatusMix({ counts }: { counts: AdminDashboard["counts"] }) {
  const { mix } = dashboard;
  const rows = statusTabs.filter((tab): tab is { id: OrderStatus; label: string } => tab.id !== "all");
  const total = counts.all;

  return (
    <section className="card chart">
      <header className="chart__header">
        <h2 className="section-label">{mix.title}</h2>
        <p className="chart__caption text-muted">{mix.caption.replace("{total}", orderCount(total, dashboard.orders))}</p>
      </header>

      {total === 0 ? (
        <p className="panel__empty text-muted">{mix.empty}</p>
      ) : (
        <>
          {/* Hovering a segment shows its figures. */}
          <div className="mix__bar" aria-hidden="true">
            {rows
              .filter((row) => counts[row.id] > 0)
              .map((row) => (
                <span key={row.id} className={`mix__segment mix--${row.id}`} style={{ flexGrow: counts[row.id] } as CSSProperties}>
                  <span className="chart-tip">
                    <span className="chart-tip__title">{row.label}</span>
                    <span className="chart-tip__row">
                      <strong>{orderCount(counts[row.id], dashboard.orders)}</strong>
                      <span>{formatPercent(counts[row.id], total)}</span>
                    </span>
                  </span>
                </span>
              ))}
          </div>
          <ul className="mix__list">
            {rows.map((row) => (
              <li key={row.id}>
                <Link className="mix__row" href={ordersLink({ status: row.id })}>
                  <span className={`mix__swatch mix--${row.id}`} aria-hidden="true" />
                  <span className="mix__label">{row.label}</span>
                  <span className="mix__count mono">{counts[row.id]}</span>
                  <span className="mix__share mono text-muted">{formatPercent(counts[row.id], total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
