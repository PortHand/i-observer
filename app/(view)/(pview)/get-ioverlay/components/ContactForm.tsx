import type { FormEvent, RefObject } from "react";
import { CircleAlert, KeyRound, Mail, MailCheck, Phone, QrCode } from "lucide-react";
import { checkout } from "../content/getContent";
import { formatAmount, getPlan } from "../helper/getHelper";
import type { ContactDraft } from "../handler/useCheckoutHandler";
import type { Order, Plan, PlanId } from "../services/getService";

interface ContactFormProps {
  plans: Plan[];
  planId: PlanId;
  order: Order | null;
  draft: ContactDraft | null;
  /** Email the verification code went to; the code field shows while this is set. */
  codeSentTo: string | null;
  emailVerified: boolean;
  /** Seconds until "Resend code" unlocks. */
  resendIn: number;
  notice: string;
  error: string;
  submitting: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  emailRef: RefObject<HTMLInputElement | null>;
  codeRef: RefObject<HTMLInputElement | null>;
  onPlanChange: (planId: PlanId) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResendCode: () => void;
  onChangeEmail: () => void;
}

export default function ContactForm({
  plans,
  planId,
  order,
  draft,
  codeSentTo,
  emailVerified,
  resendIn,
  notice,
  error,
  submitting,
  headingRef,
  emailRef,
  codeRef,
  onPlanChange,
  onSubmit,
  onResendCode,
  onChangeEmail,
}: ContactFormProps) {
  const { contact } = checkout;
  const submitLabel = codeSentTo ? contact.verifySubmit : emailVerified ? contact.submit : contact.sendCode;
  const SubmitIcon = codeSentTo || emailVerified ? QrCode : MailCheck;

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
          {plans.map((plan) => (
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
          {getPlan(plans, planId).description}
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
            defaultValue={order?.email ?? draft?.email}
            ref={emailRef}
            readOnly={codeSentTo !== null}
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
            defaultValue={order?.phone ?? draft?.phone}
            required
          />
        </span>
      </label>

      {codeSentTo && (
        <div className="otp">
          <label className="field">
            <span className="field__label">{contact.codeLabel}</span>
            <span className="input-group">
              <KeyRound className="icon" strokeWidth={1.75} />
              <input
                ref={codeRef}
                className="input otp__input mono"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder={contact.codePlaceholder}
                required
              />
            </span>
            <span className="hint">{contact.codeHint.replace("{email}", codeSentTo)}</span>
          </label>
          <div className="otp__actions">
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={onResendCode}
              disabled={submitting || resendIn > 0}
            >
              {resendIn > 0 ? contact.resendIn.replace("{seconds}", String(resendIn)) : contact.resend}
            </button>
            <button type="button" className="button button--ghost button--sm" onClick={onChangeEmail} disabled={submitting}>
              {contact.changeEmail}
            </button>
          </div>
          {notice && (
            <p className="hint" role="status">
              {notice}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{error}</span>
        </p>
      )}
      <button type="submit" className="button button--primary button--lg button--block" disabled={submitting}>
        <SubmitIcon className="icon" strokeWidth={1.75} />
        {submitLabel}
      </button>
      <p className="form-note">{contact.description}</p>
    </form>
  );
}
