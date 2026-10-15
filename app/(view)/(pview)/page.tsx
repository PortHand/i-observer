import { Suspense } from "react";
import HomeView from "./home";
import { PricingNotice } from "./home/components/Pricing";
import PricingLoader from "./home/components/PricingLoader";

export default function Page() {
  // HomeView runs in the browser; the pricing cards read the database, so they're rendered here on
  // the server and handed in.
  return (
    <HomeView
      pricing={
        <Suspense fallback={<PricingNotice />}>
          <PricingLoader />
        </Suspense>
      }
    />
  );
}
