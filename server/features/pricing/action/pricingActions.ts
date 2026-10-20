"use server";

// Server Action for the admin portal's Plans page. Anyone can call a Server Action, so it checks
// the admin role on the server before doing anything.

import { updateTag } from "next/cache";
import { emptyPlanInput, parsePlanForm, type PlanInput } from "@/app/(view)/sview/admin/helper/planHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { plansCacheTag, pricingService } from "../module/pricingModule";

/** Turns a plan on or off for sale from the plans table, then returns every plan as saved. */
export async function setPlanActive(id: string, active: boolean) {
  return runAction(async () => {
    await assertAdmin();
    await pricingService.setPlanActive(String(id ?? ""), active === true);
    updateTag(plansCacheTag);
    return { plans: await pricingService.adminPlans() };
  });
}

/** Adds a plan (`isNew`) or saves changes to one, then returns every plan as saved. */
export async function savePlan(input: PlanInput, isNew: boolean) {
  return runAction(async () => {
    await assertAdmin();
    // Same checks and messages as the form in the browser.
    const parsed = parsePlanForm(input ?? emptyPlanInput(0));
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    await pricingService.savePlan(parsed.change, isNew === true);
    // The website, checkout and GET /api/plans show the change from the next request.
    updateTag(plansCacheTag);
    return { plans: await pricingService.adminPlans() };
  });
}
