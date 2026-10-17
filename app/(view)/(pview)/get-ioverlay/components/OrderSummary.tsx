import { Mail } from "lucide-react";
import { checkout, payment } from "../content/getContent";
import { formatAmount, formatPhone } from "../helper/getHelper";
import type { Order } from "../services/getService";

interface OrderSummaryProps {
  amount: number;
  label: string;
  /** The order once it exists: adds the contact row. */
  order: Order | null;
  /** Show "Edit" next to the contact details (on the pay and transaction steps). */
  canEdit: boolean;
  onEdit: () => void;
}

/** The card beside the checkout step: what's being bought, for how much, and where the login goes. */
export default function OrderSummary({ amount, label, order, canEdit, onEdit }: OrderSummaryProps) {
  const { summary } = checkout;
  return (
    <aside className="checkout-summary">
      <h3 className="checkout-summary__title">{summary.title}</h3>
      <dl className="order">
        <div className="order__row order__row--amount">
          <dt className="field__label">{summary.amountLabel}</dt>
          <dd className="order__amount display">{formatAmount(amount)}</dd>
        </div>
        <div className="order__row">
          <dt className="field__label">{summary.label}</dt>
          <dd>{label}</dd>
        </div>
        <div className="order__row">
          <dt className="field__label">{summary.deliveryLabel}</dt>
          <dd>{summary.delivery}</dd>
        </div>
        {order && (
          <div className="order__row">
            <dt className="field__label">{summary.contactLabel}</dt>
            <dd className="order__contact">
              <span>
                {order.email}
                <br />
                {formatPhone(order.phone)}
              </span>
              {canEdit && (
                <button type="button" className="button button--secondary button--sm" onClick={onEdit}>
                  {summary.edit}
                </button>
              )}
            </dd>
          </div>
        )}
      </dl>
      <p className="hint">
        <Mail className="icon icon--sm" strokeWidth={1.75} />
        <span>
          {summary.help}{" "}
          <a className="text-link" href={`mailto:${payment.supportEmail}`}>
            {payment.supportEmail}
          </a>
        </span>
      </p>
    </aside>
  );
}
