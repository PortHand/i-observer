import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { profile } from "../content/profileContent";

/** Lines standing in for a card's text while the account loads. */
export const CardLines = ({ lines = 4 }: { lines?: number }) => (
  <>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} variant="line" width={`${90 - index * 12}%`} />
    ))}
  </>
);

/** The profile page while the session and account load: the real title, then the two cards' shapes. */
export default function ProfileSkeleton() {
  return (
    <SkeletonRegion label="Loading your profile…" className="profile-page">
      <PageHero {...profile} />
      <div className="profile-grid">
        <div className="card account-card">
          <Skeleton variant="small" width="30%" />
          <div className="profile">
            <Skeleton width={44} height={44} />
            <Skeleton variant="line" width="55%" />
          </div>
          <CardLines />
        </div>
        <div className="card access-card theme-ink">
          <Skeleton variant="small" width="30%" />
          <Skeleton variant="title" width="60%" />
          <CardLines lines={2} />
          <Skeleton variant="button" />
        </div>
      </div>
      <div className="card feedback">
        <Skeleton variant="title" width="40%" />
        <CardLines lines={3} />
      </div>
    </SkeletonRegion>
  );
}
