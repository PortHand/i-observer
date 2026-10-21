import type { Metadata } from "next";
import { Suspense } from "react";
import JsonLd from "@/components/common/JsonLd";
import { apiRoutes, routes } from "@/helper/route";
import { howToJsonLd, pageMetadata, seo, videoJsonLd } from "@/helper/seo";
import { demo, howSection, howSteps } from "./home/content/homeContent";
import HomeView from "./home";
import PricingLoader from "./home/components/PricingLoader";
import PricingSkeleton from "./home/components/PricingSkeleton";
import SiteHeader from "./home/components/SiteHeader";
import SoftwareJsonLd from "./home/components/SoftwareJsonLd";

export const metadata: Metadata = pageMetadata({
  title: seo.defaultTitle,
  absoluteTitle: true,
  description: seo.description,
  path: routes.home,
});

export default function Page() {
  // The header (session) and pricing cards (database) stream in; they're rendered here and handed
  // to HomeView, which lays out the page.
  return (
    <>
      <HomeView
        header={<SiteHeader current={routes.home} />}
        pricing={
          <Suspense fallback={<PricingSkeleton />}>
            <PricingLoader />
          </Suspense>
        }
      />
      <Suspense fallback={null}>
        <SoftwareJsonLd />
      </Suspense>
      <JsonLd
        data={[
          videoJsonLd({
            name: demo.videoTitle,
            description: demo.videoDescription,
            path: apiRoutes.introVideo,
            thumbnailPath: demo.videoPoster,
            uploadDate: demo.videoUploaded,
          }),
          howToJsonLd(howSection.title, howSteps),
        ]}
      />
    </>
  );
}
