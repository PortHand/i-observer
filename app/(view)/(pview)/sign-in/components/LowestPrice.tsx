import { connection } from "next/server";
import { getPlans } from "@/server/features/pricing/module/pricingModule";
import { formatAmount } from "../../get-ioverlay/helper/getHelper";
import { buy } from "../content/signInContent";

/** "Plans from ₹499" under the buy button, from the cheapest active plan. Render inside <Suspense>. */
export default async function LowestPrice() {
  // Prices come from the database, so read them per request (cached a minute), never at build time.
  await connection();
  const plans = await getPlans();
  if (plans.length === 0) return null;
  const lowest = Math.min(...plans.map((plan) => plan.amount));
  return <p className="sign-in__price mono">{buy.price.replace("{price}", formatAmount(lowest))}</p>;
}
