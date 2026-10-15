import { Suspense } from "react";
import { routes } from "@/helper/route";
import HomeView from "./home";
import { PricingNotice } from "./home/components/Pricing";
import PricingLoader from "./home/components/PricingLoader";
import SiteHeader from "./home/components/SiteHeader";

export default function Page() {
  // HomeView runs in the browser; the header (session) and pricing cards (database) need the
  // server, so they're rendered here and handed in.
  return (
    <HomeView
      header={<SiteHeader current={routes.home} />}
      pricing={
        <Suspense fallback={<PricingNotice />}>
          <PricingLoader />
        </Suspense>
      }
    />
  );
}
