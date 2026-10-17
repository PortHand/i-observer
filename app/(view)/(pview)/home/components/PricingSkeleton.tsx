import type { CSSProperties } from "react";
import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import { pricing } from "../content/homeContent";
import { PricingSection } from "./Pricing";

const PLACEHOLDER_PLANS = 3;

/** The plan cards' shape while prices load from the database, so the section doesn't jump when they arrive. */
export default function PricingSkeleton() {
  return (
    <PricingSection>
      <SkeletonRegion label={pricing.loading}>
        <div className="plans" style={{ "--plan-count": PLACEHOLDER_PLANS } as CSSProperties}>
          {Array.from({ length: PLACEHOLDER_PLANS }, (_, index) => (
            <div key={index} className="plan plan--skeleton">
              <div className="plan__header">
                <Skeleton width={36} height={36} />
                <Skeleton variant="line" width="40%" />
              </div>
              <Skeleton width="55%" height={48} />
              <Skeleton variant="small" width="85%" />
              <div className="checklist">
                {Array.from({ length: pricing.features.length }, (_, line) => (
                  <Skeleton key={line} variant="small" width={`${70 - line * 8}%`} />
                ))}
              </div>
              <Skeleton variant="button" width="100%" />
            </div>
          ))}
        </div>
      </SkeletonRegion>
    </PricingSection>
  );
}
