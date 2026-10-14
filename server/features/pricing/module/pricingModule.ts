// Wires the pricing feature together. Pages read plans through getPlans; the order feature takes
// pricingService in its constructor.

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Plan } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { PricingRepository } from "../repository/pricingRepository";
import { PricingService } from "../service/pricingService";

export const pricingService = new PricingService(new PricingRepository());

/** Revalidate this tag after changing plans, e.g. from a future admin panel: revalidateTag(plansCacheTag). */
export const plansCacheTag = "plans";

/**
 * Active plans for pages, cached for a minute so edits made straight in the database show up
 * quickly. Callers call `await connection()` first, so `next build` doesn't need the database, and
 * render inside <Suspense>.
 */
export async function getPlans(): Promise<Plan[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 120 });
  cacheTag(plansCacheTag);
  return pricingService.listPlans();
}
