import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { adminOrderLink } from "@/helper/route";
import type { AdminOrderSummary } from "../services/adminService";
import StatusBadge from "./StatusBadge";

interface OrderPanelProps {
  title: string;
  link: { href: string; label: string };
  empty: string;
  orders: AdminOrderSummary[];
  /** Right-hand text per row, e.g. how long it has waited. */
  meta: (order: AdminOrderSummary) => string;
  /** Show each order's status badge (for mixed lists). */
  showStatus?: boolean;
}

/** A short list of orders on the dashboard, each opening its review page. */
export default function OrderPanel({ title, link, empty, orders, meta, showStatus = false }: OrderPanelProps) {
  return (
    <section className="card panel">
      <header className="panel__header">
        <h2 className="section-label">{title}</h2>
        <Link className="panel__link mono" href={link.href}>
          {link.label}
          <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
        </Link>
      </header>
      {orders.length === 0 ? (
        <p className="panel__empty text-muted">{empty}</p>
      ) : (
        <ul className="panel__list">
          {orders.map((order) => (
            <li key={order.reference}>
              <Link className="panel__row" href={adminOrderLink(order.reference)}>
                <span className="panel__main">
                  <span className="mono panel__reference">{order.reference}</span>
                  <span className="text-muted panel__email">{order.email}</span>
                </span>
                {showStatus && <StatusBadge status={order.status} />}
                <span className="panel__side">
                  <span className="mono panel__amount">{formatAmount(order.amount)}</span>
                  <span className="text-muted panel__meta">{meta(order)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
