import { ArrowRight, Check, Info } from "lucide-react";
import { plans, pricing, type Plan } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

interface PricingProps {
  status: string;
  onChoose: (plan: Plan) => void;
}

export default function Pricing({ status, onChoose }: PricingProps) {
  return (
    <section className="band band--light" id="pricing">
      <div className="container section">
        <SectionHeader eyebrow={pricing.eyebrow} title={pricing.title} lead={pricing.lead} />
        <div className="plans">
          {plans.map((plan) => {
            const { icon: Icon } = plan;
            return (
              <article
                key={plan.name}
                className={plan.highlighted ? "plan plan--highlighted theme-ink" : "plan"}
              >
                <div className="plan__header">
                  <span className="icon-tile">
                    <Icon className="icon" strokeWidth={1.75} />
                  </span>
                  <h3 className="plan__name">{plan.name}</h3>
                  {plan.highlighted && <span className="plan__badge">{pricing.badge}</span>}
                </div>
                <p className="plan__price">
                  {plan.price}
                  <span className="plan__period">{plan.period}</span>
                </p>
                <p className="plan__description">{plan.description}</p>
                <ul className="checklist">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check className="icon icon--sm" strokeWidth={1.75} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`button button--block ${plan.highlighted ? "button--primary" : "button--secondary"}`}
                  onClick={() => onChoose(plan)}
                >
                  Choose {plan.name}
                  <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
                </button>
              </article>
            );
          })}
        </div>
        {status && (
          <p className="notice" role="status">
            <Info className="icon" strokeWidth={1.75} />
            <span>{status}</span>
          </p>
        )}
      </div>
    </section>
  );
}
