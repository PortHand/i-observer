import type { FormEvent, RefObject } from "react";
import { ArrowLeft, CircleAlert, Hash, Mail, Send } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { checkout } from "../content/getContent";
import { formatAmount, formatPhone, supportMailto } from "../helper/getHelper";
import type { Order } from "../services/getService";

interface TransactionFormProps {
  order: Order;
  error: string;
  submitting: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export default function TransactionForm({
  order,
  error,
  submitting,
  headingRef,
  onSubmit,
  onBack,
}: TransactionFormProps) {
  const { transaction } = checkout;
  const mailto = supportMailto(
    `iOverlay payment ${order.reference}`,
    [
      order.planLabel,
      `Reference: ${order.reference}`,
      `Amount: ${formatAmount(order.amount)}`,
      `Email: ${order.email}`,
      `Phone: ${formatPhone(order.phone)}`,
      "UTR / transaction ID: ",
      "",
      "(Attach the payment screenshot if you have it.)",
    ].join("\n"),
  );

  return (
    <form className="form" noValidate onSubmit={onSubmit}>
      <header className="auth__header">
        <span className="mono accent">{transaction.label}</span>
        <h3 ref={headingRef} tabIndex={-1}>
          {transaction.title}
        </h3>
        <p className="text-muted">{transaction.description}</p>
      </header>
      <label className="field">
        <span className="field__label">{transaction.utrLabel}</span>
        <span className="input-group">
          <Hash className="icon" strokeWidth={1.75} />
          <input
            className="input mono-input"
            name="utr"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={16}
            placeholder={transaction.utrPlaceholder}
            required
          />
        </span>
      </label>
      <label className="field">
        <span className="field__label">{transaction.screenshotLabel}</span>
        <input className="file-input" name="screenshot" type="file" accept="image/png,image/jpeg" />
        <span className="hint">{transaction.screenshotHint}</span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{error}</span>
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>
          <ArrowLeft className="icon icon--sm" strokeWidth={1.75} />
          {transaction.back}
        </button>
        <button type="submit" className="button button--primary" disabled={submitting} aria-busy={submitting || undefined}>
          {submitting ? <Spinner /> : <Send className="icon icon--sm" strokeWidth={1.75} />}
          {transaction.submit}
        </button>
      </div>
      <a className="hint text-link" href={mailto}>
        <Mail className="icon icon--sm" strokeWidth={1.75} />
        {transaction.emailInstead}
      </a>
    </form>
  );
}
