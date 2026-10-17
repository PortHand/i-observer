import { Check } from "lucide-react";
import { checkout, type CheckoutStep } from "../content/getContent";

/** Numbered progress across the top of checkout; every step reads as done once the order is sent. */
export default function CheckoutStepper({ step }: { step: CheckoutStep }) {
  // "done" isn't in the list, so every step counts as complete then.
  const stepIndex = checkout.progress.findIndex((item) => item.step === step);
  const currentIndex = stepIndex === -1 ? checkout.progress.length : stepIndex;

  return (
    <ol className="stepper" aria-label={checkout.progressLabel}>
      {checkout.progress.map(({ step: id, label, hint }, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
        return (
          <li
            key={id}
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
  );
}
