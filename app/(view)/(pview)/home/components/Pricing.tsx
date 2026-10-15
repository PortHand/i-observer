import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { checkoutPlanLink, homeSections } from "@/helper/route";
import { formatAmount } from "../../get-ioverlay/helper/getHelper";
import type { Plan } from "../../get-ioverlay/services/getService";
import { appInfo, pricing } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

/** The plan cards, from the plans on sale in the database. `plans` must not be empty: see PricingLoader. */
export default function Pricing({ plans }: { plans: Plan[] }) {
  return (
    <PricingSection>
      <div className="plans" style={{ "--plan-count": plans.length } as CSSProperties}>
        {plans.map((plan, index) => {
          const Icon = pricing.icons[index % pricing.icons.length];
          // The plan checkout pre-selects is the one to draw attention to.
          const highlighted = plan.isDefault;
          return (
            <article key={plan.id} className={highlighted ? "plan plan--highlighted theme-ink" : "plan"}>
              <div className="plan__header">
                <span className="icon-tile">
                  <Icon className="icon" strokeWidth={1.75} />
                </span>
                <h3 className="plan__name">{plan.name}</h3>
                {plan.badge && <span className="plan__badge">{plan.badge}</span>}
              </div>
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
        })}
      </div>
    </PricingSection>
  );
}

/** Shown instead of the cards while plans load, or when they can't be loaded. */
export function PricingNotice({ unavailable = false }: { unavailable?: boolean }) {
  const [before, after] = pricing.unavailable.split("{supportEmail}");
  return (
    <PricingSection>
      <p className="notice" role="status">
        <Info className="icon" strokeWidth={1.75} />
        {unavailable ? (
          <span>
            {before}
            <a className="text-link" href={`mailto:${appInfo.supportEmail}`}>
              {appInfo.supportEmail}
            </a>
            {after}
          </span>
        ) : (
          <span>{pricing.loading}</span>
        )}
      </p>
    </PricingSection>
  );
}

/** The section and its heading, so "#pricing" links land here whether or not the plans have loaded. */
function PricingSection({ children }: { children: ReactNode }) {
  return (
    <section className="band band--light" id={homeSections.pricing}>
      <div className="container section">
        <SectionHeader eyebrow={pricing.eyebrow} title={pricing.title} lead={pricing.lead} />
        {children}
      </div>
    </section>
  );
}
