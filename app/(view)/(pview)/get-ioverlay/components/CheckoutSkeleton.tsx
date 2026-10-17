import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import { checkout, checkoutSectionId } from "../content/getContent";
import CheckoutHeader from "./CheckoutHeader";

/** The checkout's shape while plans load: stepper, the contact form and the order summary. */
export default function CheckoutSkeleton() {
  return (
    <section className="band band--light" id={checkoutSectionId}>
      <div className="container section">
        <CheckoutHeader />
        <SkeletonRegion label={checkout.loading} className="checkout-flow">
          <div className="stepper">
            {checkout.progress.map(({ step }, index) => (
              <div key={step} className={index === 0 ? "stepper__item stepper__item--current" : "stepper__item"}>
                <Skeleton width={32} height={32} />
                <Skeleton variant="line" width="60%" />
              </div>
            ))}
          </div>
          <div className="checkout">
            <div className="card checkout__panel checkout-skeleton">
              <Skeleton variant="small" width="30%" />
              <Skeleton variant="title" width="60%" />
              <div className="plan-tiles">
                {[0, 1, 2].map((tile) => (
                  <Skeleton key={tile} height={96} />
                ))}
              </div>
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton variant="button" width="100%" height={52} />
            </div>
            <div className="checkout-summary checkout-skeleton">
              <Skeleton variant="line" width="50%" />
              <Skeleton width="45%" height={48} />
              <Skeleton variant="small" width="80%" />
              <Skeleton variant="small" width="65%" />
            </div>
          </div>
        </SkeletonRegion>
      </div>
    </section>
  );
}
