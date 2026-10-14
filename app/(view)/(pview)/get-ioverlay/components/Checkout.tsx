"use client";

import { Check, Mail } from "lucide-react";
import { checkout, checkoutSectionId, payment } from "../content/getContent";
import { useCheckoutHandler } from "../handler/useCheckoutHandler";
import { formatAmount, formatPhone, getPlan, planTitle } from "../helper/getHelper";
import type { Plan } from "../services/getService";
import Confirmation from "./Confirmation";
import ContactForm from "./ContactForm";
import PayPanel from "./PayPanel";
import TransactionForm from "./TransactionForm";

interface CheckoutProps {
  /** Active plans from the database. Must not be empty: CheckoutLoader shows a notice instead. */
  plans: Plan[];
}

export default function Checkout({ plans }: CheckoutProps) {
  const co = useCheckoutHandler(plans);
  const { summary } = checkout;
  // "done" isn't in the list, so every step counts as complete then.
  const stepIndex = checkout.progress.findIndex(({ step }) => step === co.step);
  const currentIndex = stepIndex === -1 ? checkout.progress.length : stepIndex;
  // Once an order exists, show what the server fixed for it rather than the plan list's current price.
  const plan = getPlan(plans, co.planId);
  const amount = co.order && co.step !== "contact" ? co.order.amount : plan.amount;
  const label = co.order && co.step !== "contact" ? co.order.planLabel : planTitle(plan);
  const canEdit = co.order !== null && (co.step === "pay" || co.step === "transaction");

  return (
    <section className="band band--light" id={checkoutSectionId}>
      <div className="container section">
        <header className="section__header">
          <div className="stack-sm">
            <span className="eyebrow">{checkout.eyebrow}</span>
            <h2 className="display section__title">{checkout.title}</h2>
          </div>
          <p className="lead">{checkout.lead}</p>
        </header>

        <div className="checkout-flow">
          <ol className="stepper" aria-label={checkout.progressLabel}>
            {checkout.progress.map(({ step, label, hint }, index) => {
              const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
              return (
                <li
                  key={step}
                  className={`stepper__item stepper__item--${state}`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <span className="stepper__marker mono" aria-hidden="true">
                    {state === "done" ? <Check className="icon icon--sm" strokeWidth={2.25} /> : index + 1}
                  </span>
                  <span className="stepper__text">
                    <span className="stepper__label">{label}</span>
                    <span className="stepper__hint">{hint}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="checkout">
            <div className="card checkout__panel">
              {co.step === "contact" && (
                <ContactForm
                  plans={plans}
                  planId={co.planId}
                  order={co.order}
                  error={co.error}
                  submitting={co.submitting}
                  headingRef={co.headingRef}
                  onPlanChange={co.setPlanId}
                  onSubmit={co.handleContact}
                />
              )}
              {co.step === "pay" && co.order && (
                <PayPanel
                  order={co.order}
                  copied={co.copied}
                  headingRef={co.headingRef}
                  onCopy={co.handleCopy}
                  onBack={() => co.goTo("contact")}
                  onPaid={() => co.goTo("transaction")}
                />
              )}
              {co.step === "transaction" && co.order && (
                <TransactionForm
                  order={co.order}
                  error={co.error}
                  submitting={co.submitting}
                  headingRef={co.headingRef}
                  onSubmit={co.handleTransaction}
                  onBack={() => co.goTo("pay")}
                />
              )}
              {co.step === "done" && co.summary && (
                <Confirmation
                  summary={co.summary}
                  downloading={co.downloading}
                  downloadError={co.downloadError}
                  headingRef={co.headingRef}
                  onDownload={co.handleDownload}
                />
              )}
            </div>

            <aside className="order-card">
              <h3 className="order-card__title">{summary.title}</h3>
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
                {co.order && (
                  <div className="order__row">
                    <dt className="field__label">{summary.contactLabel}</dt>
                    <dd className="order__contact">
                      <span>
                        {co.order.email}
                        <br />
                        {formatPhone(co.order.phone)}
                      </span>
                      {canEdit && (
                        <button type="button" className="button button--secondary button--sm" onClick={() => co.goTo("contact")}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
