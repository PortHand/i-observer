// GET /api/app/update?version=1.0.0: whether the desktop app (iobserver-app/src/main/update.ts)
// must be updated before it can be used. No sign-in needed: the app asks before anyone signs in.
//   200: { required, minimumVersion, latestVersion, message, downloadPath }. required is true when
//   an admin turned on force update (admin portal → Force update) and `version` is older than
//   minimumVersion. downloadPath is the website page with the installers.
//   400 when `version` is missing or not like "1.2.0".

import { connection } from "next/server";
import { isVersion } from "@/app/(view)/sview/admin/helper/appUpdateHelper";
import { runRoute } from "@/server/core/baseRoute";
import { HttpError } from "@/server/core/httpError";
import { getAppUpdatePolicy } from "@/server/features/appUpdate/module/appUpdateModule";
import { AppUpdateService } from "@/server/features/appUpdate/service/appUpdateService";

export async function GET(request: Request) {
  // Checked per request, never prerendered: the policy changes from the admin portal.
  await connection();
  return runRoute(async () => {
    const version = new URL(request.url).searchParams.get("version")?.trim() ?? "";
    if (!isVersion(version)) throw HttpError.badRequest("Send the app version, e.g. ?version=1.2.0.");
    return AppUpdateService.check(await getAppUpdatePolicy(), version);
  });
}
