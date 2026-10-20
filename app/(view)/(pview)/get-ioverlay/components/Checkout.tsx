"use client";

import { checkoutSectionId } from "../content/getContent";
import { useCheckoutHandler } from "../handler/useCheckoutHandler";
import { getPlan, planTitle } from "../helper/getHelper";
import type { Plan } from "../services/getService";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutStepper from "./CheckoutStepper";
import Confirmation from "./Confirmation";
import ContactForm from "./ContactForm";
import FreeClaimed from "./FreeClaimed";
import OrderSummary from "./OrderSummary";
import OtpModal from "./OtpModal";
import PayPanel from "./PayPanel";
import TransactionForm from "./TransactionForm";

interface CheckoutProps {
  /** Active plans from the database. Must not be empty: CheckoutLoader shows a notice instead. */
  plans: Plan[];
  /** Plan to pre-select, e.g. from ?plan=; the default plan when it's null or not on sale. */
  initialPlanId: string | null;
}

export default function Checkout({ plans, initialPlanId }: CheckoutProps) {
  const co = useCheckoutHandler(plans, initialPlanId);
  // Once an order exists, show what the server fixed for it rather than the plan list's current price.
  const plan = getPlan(plans, co.planId);
  const fromOrder = co.order !== null && co.step !== "contact";
  const canEdit = co.order !== null && (co.step === "pay" || co.step === "transaction");

  return (
    <section className="band band--light" id={checkoutSectionId}>
      <div className="container section">
        <CheckoutHeader />

        <div className="checkout-flow">
          <CheckoutStepper step={co.step} />

          <div className="checkout">
            <div className="card checkout__panel">
              {co.step === "contact" && (
                <ContactForm
                  plans={plans}
                  planId={co.planId}
                  order={co.order}
                  draft={co.draft}
                  error={co.error}
                  submitting={co.submitting}
                  headingRef={co.headingRef}
                  emailRef={co.emailRef}
                  onPlanChange={co.setPlanId}
                  onSubmit={co.handleContact}
                />
              )}
              <OtpModal
                open={co.otpOpen}
                email={co.codeSentTo ?? co.draft?.email ?? ""}
                error={co.otpError}
                notice={co.notice}
                submitting={co.submitting}
                resendIn={co.resendIn}
                onVerify={co.handleVerifyCode}
                onResend={co.handleResendCode}
                onChangeEmail={co.handleChangeEmail}
                onClose={co.handleCloseOtp}
              />
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
              {co.step === "done" && co.order?.claimed && <FreeClaimed order={co.order} headingRef={co.headingRef} />}
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

            <OrderSummary
              amount={fromOrder && co.order ? co.order.amount : plan.amount}
              label={fromOrder && co.order ? co.order.planLabel : planTitle(plan)}
              order={co.order}
              canEdit={canEdit}
              onEdit={() => co.goTo("contact")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
