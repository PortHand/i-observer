import type { FormEvent, RefObject } from "react";
import { CircleAlert, Mail, Phone, QrCode } from "lucide-react";
import { checkout, pricePlans, type PlanId } from "../content/getContent";
import { formatAmount, getPlan } from "../helper/getHelper";
import type { Order } from "../services/getService";

interface ContactFormProps {
  planId: PlanId;
  order: Order | null;
  error: string;
  submitting: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onPlanChange: (planId: PlanId) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ContactForm({
  planId,
  order,
  error,
  submitting,
  headingRef,
  onPlanChange,
  onSubmit,
}: ContactFormProps) {
  const { contact } = checkout;

  return (
    <form className="form form--compact" noValidate onSubmit={onSubmit}>
      <header className="auth__header">
        <span className="mono accent">{contact.label}</span>
        <h3 ref={headingRef} tabIndex={-1}>
          {contact.title}
        </h3>
      </header>

      <fieldset className="plan-picker">
        <legend className="field__label">{contact.planLabel}</legend>
        <div className="plan-tiles">
          {pricePlans.map((plan) => (
            <label key={plan.id} className="plan-tile">
              <input
                className="visually-hidden"
                type="radio"
                name="plan"
                value={plan.id}
                checked={plan.id === planId}
                onChange={() => onPlanChange(plan.id)}
              />
              {plan.badge && <span className="plan-tile__badge">{plan.badge}</span>}
              <span className="plan-tile__name">{plan.name}</span>
              <span className="plan-tile__price display">{formatAmount(plan.amount)}</span>
              <span className="plan-tile__period">{plan.period}</span>
            </label>
          ))}
        </div>
        <p className="plan-picker__description" aria-live="polite">
          {getPlan(planId).description}
        </p>
      </fieldset>

      <label className="field">
        <span className="field__label">{contact.emailLabel}</span>
        <span className="input-group">
          <Mail className="icon" strokeWidth={1.75} />
          <input
            className="input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={contact.emailPlaceholder}
            defaultValue={order?.email}
            required
          />
        </span>
      </label>
      <label className="field">
        <span className="field__label">{contact.phoneLabel}</span>
        <span className="input-group">
          <Phone className="icon" strokeWidth={1.75} />
          <span className="input-prefix mono" aria-hidden="true">
            {contact.phonePrefix}
          </span>
          <input
            className="input input--prefixed"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={contact.phonePlaceholder}
            defaultValue={order?.phone}
            required
          />
        </span>
      </label>

      {error && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{error}</span>
        </p>
      )}
      <button type="submit" className="button button--primary button--lg button--block" disabled={submitting}>
        <QrCode className="icon" strokeWidth={1.75} />
        {contact.submit}
      </button>
      <p className="form-note">{contact.description}</p>
    </form>
  );
}
