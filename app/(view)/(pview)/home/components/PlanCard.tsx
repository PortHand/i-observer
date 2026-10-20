import Link from "next/link";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { checkoutPlanLink } from "@/helper/route";
import { discountPercent, formatAmount } from "../../get-ioverlay/helper/getHelper";
import type { Plan } from "../../get-ioverlay/services/getService";
import { pricing } from "../content/homeContent";

/** One plan column: name, price, what's included and a link to checkout with it picked. */
export default function PlanCard({ plan, icon: Icon }: { plan: Plan; icon: LucideIcon }) {
  // The plan checkout pre-selects is the one to draw attention to.
  const highlighted = plan.isDefault;
  const percent = discountPercent(plan);
  return (
    <article className={highlighted ? "plan plan--highlighted theme-ink" : "plan"}>
      <div className="plan__header">
        <span className="icon-tile">
          <Icon className="icon" strokeWidth={1.75} />
        </span>
        <h3 className="plan__name">{plan.name}</h3>
        {plan.badge && <span className="plan__badge">{plan.badge}</span>}
      </div>
      {percent !== null && (
        <p className="plan__compare">
          <s className="plan__was">
            <span className="visually-hidden">{pricing.was} </span>
            {formatAmount(plan.compareAtAmount!)}
          </s>
          <span className="plan__off">{pricing.off.replace("{percent}", String(percent))}</span>
        </p>
      )}
      <p className="plan__price">
        {formatAmount(plan.amount)}
        <span className="plan__period">{plan.period}</span>
      </p>
      <p className="plan__description">{plan.description}</p>
      <ul className="checklist">
        {pricing.features.map((feature) => (
          <li key={feature}>
            <Check className="icon icon--sm" strokeWidth={1.75} />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={checkoutPlanLink(plan.id)}
        className={`button button--block ${highlighted ? "button--primary" : "button--secondary"}`}
      >
        {pricing.choose.replace("{plan}", plan.name)}
        <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
      </Link>
    </article>
  );
}
