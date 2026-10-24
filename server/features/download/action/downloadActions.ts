"use server";

// Server Actions for the welcome page's download, called straight from the page's service.

import { isAvailableInstaller, isInstallerId } from "@/app/(view)/sview/welcome/helper/welcomeHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { getCurrentUser } from "@/server/features/auth/guard/authGuard";
import { downloadService, installService } from "../module/downloadModule";

/** A fresh signed link to this installer, for the signed-in account. Fails with code "waiting", "none" or "expired" when locked. */
export async function getDownloadLink(installer: string) {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw HttpError.unauthorized("Your session has ended. Sign in again.");
    if (!isInstallerId(installer)) throw HttpError.badRequest("Choose an installer.");
    if (!isAvailableInstaller(installer)) throw HttpError.badRequest("This version is coming soon.");
    return { link: await downloadService.link(user.id, installer) };
  });
}

/** Fresh Terminal install commands for the signed-in account, with a new one-time token. Same failures as getDownloadLink. */
export async function getInstallCommands() {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw HttpError.unauthorized("Your session has ended. Sign in again.");
    return { commands: await installService.commands(user.id) };
  });
}
