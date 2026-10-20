import { requireUser } from "@/server/features/auth/guard/authGuard";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import PlansManager from "./PlansManager";

/** Every plan with its price, read fresh. Reads the session and the database: render inside <Suspense>. */
export default async function Plans() {
  await requireUser("admin");
  // Straight from the database, not the pages' cache, so the page always shows what's saved.
  const plans = await pricingService.adminPlans();
  return <PlansManager plans={plans} />;
}
