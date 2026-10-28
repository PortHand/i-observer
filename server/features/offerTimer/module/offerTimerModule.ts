// Wires the offer timer feature together. The admin portal saves the timer through the Server
// Action in action/offerTimerActions.ts; the pricing section and checkout read it through getOffer.

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Offer } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type { OfferTimerView } from "@/app/(view)/sview/admin/services/adminService";
import { OfferTimerRepository } from "../repository/offerTimerRepository";
import { OfferTimerService } from "../service/offerTimerService";

export const offerTimerService = new OfferTimerService(new OfferTimerRepository());

/** Expired by the admin portal's save (updateTag), so pages show the change straight away. */
export const offerTimerCacheTag = "offer-timer";

/** The saved timer, cached like the plans so every page view doesn't hit the database. */
async function getOfferTimer(): Promise<OfferTimerView> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  cacheTag(offerTimerCacheTag);
  return offerTimerService.timer();
}

/**
 * The countdown to show now, or null for none. Never fails the page: with a database it can't
 * reach, it logs the error and shows no countdown. Callers call `await connection()` first.
 */
export async function getOffer(): Promise<Offer | null> {
  try {
    return OfferTimerService.offer(await getOfferTimer(), Date.now());
  } catch (error) {
    console.error("[offer-timer] Couldn't load the offer timer, so no countdown is shown:", error);
    return null;
  }
}
