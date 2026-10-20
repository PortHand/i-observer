import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { welcome } from "../content/welcomeContent";

/** The welcome page's top while the session loads: the real greeting, then the tabs, steps and download bar. */
export default function WelcomeSkeleton() {
  return (
    <SkeletonRegion label="Preparing your download…" className="welcome">
      <PageHero {...welcome} />
      <div className="setup">
        <div className="setup__tabs">
          {[0, 1, 2].map((tab) => (
            <div key={tab} className="setup__tab">
              <Skeleton variant="line" width={96} />
            </div>
          ))}
        </div>
        <div className="mac-open">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="mac-open__step">
              <Skeleton height={220} />
              <Skeleton variant="title" width="70%" />
              <Skeleton variant="line" width="90%" />
            </div>
          ))}
        </div>
        <div className="card download setup__download theme-ink">
          <div className="setup__download-text">
            <Skeleton variant="small" width="25%" />
            <Skeleton variant="title" width="65%" />
          </div>
          <Skeleton variant="button" width={240} height={52} />
        </div>
      </div>
    </SkeletonRegion>
  );
}
