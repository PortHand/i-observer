import Skeleton, { SkeletonRegion } from "@/components/common/Skeleton";
import PageHero from "@/app/(view)/(pview)/home/components/PageHero";
import { installers, welcome } from "../content/welcomeContent";

/** The welcome page's top while the session loads: the real greeting, then the download card and installer list. */
export default function WelcomeSkeleton() {
  return (
    <SkeletonRegion label="Preparing your download…" className="welcome">
      <PageHero {...welcome} />
      <div className="download-wrap">
        <div className="card download theme-ink">
          <Skeleton variant="small" width="25%" />
          <Skeleton variant="title" width="65%" />
          <Skeleton variant="line" width="50%" />
          <Skeleton variant="button" width={240} height={52} />
        </div>
        <div className="installers">
          <Skeleton variant="small" width="35%" />
          <div className="installers__list">
            {installers.map((installer) => (
              <div key={installer.id} className="installer">
                <Skeleton variant="line" width="60%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
