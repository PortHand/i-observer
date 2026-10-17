import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { CardLines } from "../../profile/components/ProfileSkeleton";
import { ordersPage } from "../../profile/content/profileContent";

/** The orders page while the session and orders load: the real title, then two order cards' shapes. */
export default function OrdersSkeleton() {
  return (
    <SkeletonRegion label="Loading your orders…" className="profile-page">
      <PageHero {...ordersPage} />
      <div className="profile-section">
        <Skeleton variant="title" width={220} />
        <ul className="my-orders">
          {[0, 1].map((card) => (
            <li key={card} className="card my-order">
              <div className="my-order__header">
                <Skeleton variant="line" width={140} />
                <Skeleton width={96} height={32} />
              </div>
              <CardLines lines={3} />
            </li>
          ))}
        </ul>
      </div>
    </SkeletonRegion>
  );
}
