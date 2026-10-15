import Link from "next/link";
import { ArrowRight, Paperclip } from "lucide-react";
import { formatAmount, formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { adminOrderLink } from "@/helper/route";
import { list } from "../content/adminContent";
import { formatAge, formatIst, formatIstShort, splitPlan, waitTone } from "../helper/adminHelper";
import type { AdminOrderSummary } from "../services/adminService";
import CopyButton from "./CopyButton";
import StatusBadge from "./StatusBadge";

interface OrderCardsProps {
  orders: AdminOrderSummary[];
  /** Show how long each payment has waited (the "Needs review" list) instead of its status. */
  waiting: boolean;
  /** ISO time the list was read; ages count from here. */
  asOf: string;
}

/** A soft tint per customer, picked from their email so the same person always gets the same one. */
const tint = (email: string) => [...email].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;

/** "Monthly · 1 month", "+1" when the order has more plans. iOverlay is the only product, so its name is left out. */
const planText = (plans: string[]) => {
  const [first, ...rest] = plans;
  if (!first) return "—";
  const { name, detail } = splitPlan(first);
  return [name.replace(/^iOverlay /, ""), detail, rest.length > 0 ? list.morePlans.replace("{count}", String(rest.length)) : ""]
    .filter(Boolean)
    .join(" · ");
};

/**
 * The order list as a grid of cards. The "Review" link is stretched over the whole card, so a
 * click anywhere opens the order; the UTR's copy button sits above it.
 */
export default function OrderCards({ orders, waiting, asOf }: OrderCardsProps) {
  const now = Date.parse(asOf);

  return (
    <ul className="order-cards">
      {orders.map((order) => {
        const sent = order.submittedAt;
        return (
          <li key={order.reference} className="order-card">
            <header className="order-card__head">
              <span className={`order-card__avatar order-card__avatar--${tint(order.email)}`} aria-hidden="true">
                {order.email.charAt(0)}
              </span>
              <span className="order-card__who">
                <span className="order-card__email">{order.email}</span>
                <span className="order-card__phone">{formatPhone(order.phone)}</span>
              </span>
            </header>

            <div className="order-card__money">
              <span className="order-card__figure">
                <span className="order-card__amount">{formatAmount(order.amount)}</span>
                <span className="order-card__plan">{planText(order.plans)}</span>
              </span>
              {waiting && sent ? (
                <span className={`order-card__wait order-card__wait--${waitTone(sent, now)}`} title={formatIst(sent)}>
                  {formatAge(sent, now)}
                </span>
              ) : (
                <StatusBadge status={order.status} />
              )}
            </div>

            <dl className="order-card__facts">
              <div>
                <dt>{list.columns.reference}</dt>
                <dd className="order-card__mono">{order.reference}</dd>
              </div>
              <div>
                <dt>{list.columns.utr}</dt>
                <dd>
                  {order.utr ? (
                    <span className="order-card__utr">
                      <span className="order-card__mono">{order.utr}</span>
                      {order.hasReceipt && (
                        <span className="order-card__receipt" title={list.hasReceipt}>
                          <Paperclip className="icon icon--sm" strokeWidth={1.75} aria-hidden="true" />
                          <span className="visually-hidden">{list.hasReceipt}</span>
                        </span>
                      )}
                      <CopyButton value={order.utr} label={list.copyUtr} />
                    </span>
                  ) : (
                    <span className="order-card__muted">{list.noUtr}</span>
                  )}
                </dd>
              </div>
            </dl>

            <footer className="order-card__foot">
              <span className="order-card__date" title={formatIst(sent ?? order.createdAt)}>
                {(sent ? list.sentOn : list.createdOn).replace("{date}", formatIstShort(sent ?? order.createdAt))}
              </span>
              <Link className="order-card__link" href={adminOrderLink(order.reference)}>
                {order.status === "submitted" ? list.review : list.open}
                <span className="visually-hidden"> {order.reference}</span>
                <ArrowRight className="icon icon--sm" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </footer>
          </li>
        );
      })}
    </ul>
  );
}
