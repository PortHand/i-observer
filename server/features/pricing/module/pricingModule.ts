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

/**
 * getPlans for pages that should still render when the database is unreachable (e.g. DB_* not set
 * on the host): logs the real error on the server and returns no plans, so the page shows its
 * "unavailable" state instead of failing the whole render.
 */
export async function getPlansOrNone(): Promise<Plan[]> {
  try {
    return await getPlans();
  } catch (error) {
    console.error("[pricing] Couldn't load plans, so checkout is shown as unavailable:", error);
    return [];
  }
}
