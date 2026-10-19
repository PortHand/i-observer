"use server";

// Server Action for the admin portal's App update page. Anyone can call a Server Action, so it
// checks the admin role on the server before doing anything.

import { updateTag } from "next/cache";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { parseAppUpdateForm, type AppUpdateInput } from "@/app/(view)/sview/admin/helper/appUpdateHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { appUpdateCacheTag, appUpdateService } from "../module/appUpdateModule";

/** Saves the desktop app's forced-update policy and returns it as saved. */
export async function saveAppUpdatePolicy(input: AppUpdateInput) {
  return runAction(async () => {
    const admin = await assertAdmin();
    // Same checks and messages as the form in the browser.
    const parsed = parseAppUpdateForm(input ?? { forceUpdate: false, minimumVersion: "", message: "" }, appInfo.version);
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    await appUpdateService.save(parsed.input, admin.id);
    // Apps asking from now on get the new policy, not the cached one.
    updateTag(appUpdateCacheTag);
    return { policy: await appUpdateService.policy() };
  });
}
