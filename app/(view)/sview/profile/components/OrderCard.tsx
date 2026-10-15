import Link from "next/link";
import { Check, Paperclip } from "lucide-react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { checkoutLink, routes } from "@/helper/route";
import { orders as copy, statusText } from "../content/profileContent";
import { formatDateTime } from "../helper/profileHelper";
import type { CustomerOrder } from "../services/profileService";

/** Placed → payment sent → decided, with the decision's own label as the last step. */
const trackSteps = (order: CustomerOrder) => [
  { label: copy.columns.placed, at: order.createdAt },
  { label: copy.columns.paid, at: order.submittedAt },
  { label: order.reviewedAt ? statusText[order.status].label : statusText.verified.label, at: order.reviewedAt },
];

export default function OrderCard({ order }: { order: CustomerOrder }) {
  const status = statusText[order.status];
  const contactLink = `${routes.contact}?topic=payment&reference=${encodeURIComponent(order.reference)}#message`;

  return (
    <li className={`card my-order my-order--${order.status}`}>
      <header className="my-order__header">
        <div className="stack-sm">
          <span className="mono my-order__ref">{order.reference}</span>
          <span className={`badge badge--${order.status}`}>{status.label}</span>
        </div>
        <span className="my-order__amount">{formatAmount(order.amount)}</span>
      </header>

      <p className="text-muted my-order__status-text">{status.text}</p>

      <ol className={`order-track order-track--${order.status}`}>
        {trackSteps(order).map((step) => (
          <li key={step.label} className={step.at ? "order-track__step order-track__step--done" : "order-track__step"}>
            <span className="order-track__dot" aria-hidden="true">
              {step.at && <Check className="icon icon--xs" strokeWidth={2.5} />}
            </span>
            <span className="order-track__label mono">{step.label}</span>
            <span className="order-track__time">{step.at ? formatDateTime(step.at) : "—"}</span>
          </li>
        ))}
      </ol>

      <dl className="my-order__details">
        <div>
          <dt className="section-label">{copy.columns.plan}</dt>
          <dd>
            {order.lines.map((line) => (
              <span key={line.planId} className="my-order__line">
                <span>{line.label}</span>
                <span className="mono">{formatAmount(line.amount)}</span>
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="section-label">{copy.columns.utr}</dt>
          <dd className="mono my-order__utr">{order.utr ?? "—"}</dd>
        </div>
        <div>
          <dt className="section-label">{copy.columns.receipt}</dt>
          <dd className={order.hasReceipt ? "my-order__receipt" : "my-order__receipt my-order__receipt--missing"}>
            <Paperclip className="icon icon--sm" strokeWidth={1.75} />
            {order.hasReceipt ? copy.receiptAttached : copy.receiptMissing}
          </dd>
        </div>
      </dl>

      <footer className="my-order__footer">
        {order.status === "pending" ? (
          <Link href={checkoutLink} className="button button--primary button--sm">
            {copy.pay}
          </Link>
        ) : (
          <span className="hint">{copy.help}</span>
        )}
        <Link href={contactLink} className="button button--ghost button--sm">
          {copy.helpLink}
        </Link>
      </footer>
    </li>
  );
}
