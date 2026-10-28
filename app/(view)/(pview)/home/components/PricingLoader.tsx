import { connection } from "next/server";
import { getOffer } from "@/server/features/offerTimer/module/offerTimerModule";
import { getPlansOrNone } from "@/server/features/pricing/module/pricingModule";
import Pricing, { PricingNotice } from "./Pricing";

/**
 * Reads the plans on sale and the offer timer from the database (cached for a minute) and renders
 * the pricing cards, or a notice when there are none or the database can't be reached. Render
 * inside <Suspense>.
 */
export default async function PricingLoader() {
  // Prices come from the database, so read them per request (cached a minute), never at build time.
  await connection();
  const [plans, offer] = await Promise.all([getPlansOrNone(), getOffer()]);
  return plans.length > 0 ? <Pricing plans={plans} offer={offer} /> : <PricingNotice />;
}
