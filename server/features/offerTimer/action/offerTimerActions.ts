"use server";

// Server Action for the admin portal's Offer timer page. Anyone can call a Server Action, so it
// checks the admin role on the server before doing anything.

import { updateTag } from "next/cache";
import { emptyOfferTimerInput, parseOfferTimerForm, type OfferTimerInput } from "@/app/(view)/sview/admin/helper/offerTimerHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { offerTimerCacheTag, offerTimerService } from "../module/offerTimerModule";

/**
 * Saves the offer timer and returns it as saved. With `reset`, the countdown starts again from
 * now for the timer's length instead of ending at the form's end time.
 */
export async function saveOfferTimer(input: OfferTimerInput, reset: boolean) {
  return runAction(async () => {
    const admin = await assertAdmin();
    // Same checks and messages as the form in the browser.
    const parsed = parseOfferTimerForm(input ?? emptyOfferTimerInput(), { reset: reset === true, now: Date.now() });
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    await offerTimerService.save(parsed.change, admin.id);
    // The pricing section and checkout show the new countdown from the next request.
    updateTag(offerTimerCacheTag);
    return { timer: await offerTimerService.timer() };
  });
}
