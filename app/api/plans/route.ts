// GET /api/plans: the plans on sale, for clients outside this site (the iobserver-app Home page).
// Same data as the home page's pricing cards: read through getPlansOrNone, cached for a minute.

import { connection } from "next/server";
import { checkoutPlanLink } from "@/helper/route";
import { payment } from "@/app/(view)/(pview)/get-ioverlay/content/getContent";
import { pricing } from "@/app/(view)/(pview)/home/content/homeContent";
import { getPlansOrNone } from "@/server/features/pricing/module/pricingModule";

export async function GET() {
  // Prices come from the database, so read them per request, never at build time.
  await connection();
  const plans = await getPlansOrNone();
  return Response.json(
    {
      currency: payment.currency,
      /** Every plan is the full app, so the features are the same for each. */
      features: pricing.features,
      plans: plans.map((plan) => ({ ...plan, checkoutPath: checkoutPlanLink(plan.id) })),
    },
    // An empty list means the database couldn't be read: clients show their "unavailable" state.
    { status: plans.length > 0 ? 200 : 503, headers: { "Cache-Control": "public, max-age=60" } },
  );
}
