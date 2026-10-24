import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";
import { homeSections } from "@/helper/route";
import type { Plan } from "../../get-ioverlay/services/getService";
import { appInfo, pricing } from "../content/homeContent";
import PlanCard from "./PlanCard";
import SectionHeader from "./SectionHeader";

/** The plan cards, from the plans on sale in the database. `plans` must not be empty: see PricingLoader. */
export default function Pricing({ plans }: { plans: Plan[] }) {
  return (
    <PricingSection>
      <div className="plans" style={{ "--plan-count": plans.length } as CSSProperties}>
        {plans.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} index={index} icon={pricing.icons[index % pricing.icons.length]} />
        ))}
      </div>
    </PricingSection>
  );
}

/** Shown instead of the cards when plans can't be loaded. */
export function PricingNotice() {
  const [before, after] = pricing.unavailable.split("{supportEmail}");
  return (
    <PricingSection>
      <p className="notice" role="status">
        <Info className="icon" strokeWidth={1.75} />
        <span>
          {before}
          <a className="text-link" href={`mailto:${appInfo.supportEmail}`}>
            {appInfo.supportEmail}
          </a>
          {after}
        </span>
      </p>
    </PricingSection>
  );
}

/** The section and its heading, so "#pricing" links land here whether or not the plans have loaded. */
export function PricingSection({ children }: { children: ReactNode }) {
  return (
    <section className="band band--light" id={homeSections.pricing}>
      <div className="container section">
        <SectionHeader eyebrow={pricing.eyebrow} title={pricing.title} lead={pricing.lead} />
        {children}
      </div>
    </section>
  );
}
