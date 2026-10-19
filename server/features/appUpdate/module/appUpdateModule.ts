// Wires the app update feature together. The admin portal saves the policy through the Server
// Action in action/appUpdateActions.ts; the desktop app reads it from GET /api/app/update.

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { AppUpdatePolicyView } from "@/app/(view)/sview/admin/services/adminService";
import { AppUpdateRepository } from "../repository/appUpdateRepository";
import { AppUpdateService } from "../service/appUpdateService";

export const appUpdateService = new AppUpdateService(new AppUpdateRepository());

/** Expired by the admin portal's save (updateTag), so a change reaches the API straight away. */
export const appUpdateCacheTag = "app-update";

/**
 * The policy for GET /api/app/update, which every running app calls: cached so those calls don't
 * each hit the database. Callers call `await connection()` first, so `next build` doesn't need it.
 */
export async function getAppUpdatePolicy(): Promise<AppUpdatePolicyView> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  cacheTag(appUpdateCacheTag);
  return appUpdateService.policy();
}
