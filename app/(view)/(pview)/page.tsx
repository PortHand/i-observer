import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import { pageMetadata, seo } from "@/helper/seo";
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
    </>
  );
}
