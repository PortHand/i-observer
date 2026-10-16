import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import { pageMetadata, seo } from "@/helper/seo";
import HomeView from "./home";
import { PricingNotice } from "./home/components/Pricing";
import PricingLoader from "./home/components/PricingLoader";
import SiteHeader from "./home/components/SiteHeader";
import SoftwareJsonLd from "./home/components/SoftwareJsonLd";

export const metadata: Metadata = pageMetadata({
  title: seo.defaultTitle,
  absoluteTitle: true,
  description: seo.description,
  path: routes.home,
});

export default function Page() {
  // HomeView runs in the browser; the header (session) and pricing cards (database) need the
  // server, so they're rendered here and handed in.
  return (
    <>
      <HomeView
        header={<SiteHeader current={routes.home} />}
        pricing={
          <Suspense fallback={<PricingNotice />}>
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
