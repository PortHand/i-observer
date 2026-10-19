import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { appUpdateService } from "@/server/features/appUpdate/module/appUpdateModule";
import AppUpdateForm from "./AppUpdateForm";

/** The saved forced-update policy, read fresh. Reads the session and the database: render inside <Suspense>. */
export default async function AppUpdate() {
  await requireUser("admin");
  // Straight from the database, not the API's cache, so the page always shows what's saved.
  const policy = await appUpdateService.policy();
  return <AppUpdateForm initial={policy} latestVersion={appInfo.version} />;
}
