import "server-only";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import type { InstallerId } from "@/app/(view)/sview/welcome/content/welcomeContent";
import { installerFileName } from "@/app/(view)/sview/welcome/helper/welcomeHelper";
import type { DownloadLink } from "@/app/(view)/sview/welcome/services/welcomeService";
import { HttpError } from "@/server/core/httpError";
import type { AccountService } from "@/server/features/account/service/accountService";
import type { SignedLinks } from "@/server/features/storage/service/storageService";

/**
 * How long a download link works, in seconds. The page makes one per click and starts it at once,
 * so a minute is plenty; a download already running finishes after the link expires.
 */
export const DOWNLOAD_LINK_SECONDS = 60;

const messages = {
  locked: "Your download unlocks once you have an active plan.",
  unavailable: "This installer isn't available right now. Please try again in a few minutes or contact support.",
};

/** Where an installer sits in the downloads bucket: releases/<version>/<file>. */
const installerPath = (fileName: string) => `releases/${appInfo.version}/${fileName}`;

/**
 * Short-lived links to the app installers, which sit in a private bucket (S3, or Supabase without it). Only accounts with access
 * get one; each link expires after DOWNLOAD_LINK_SECONDS and makes the browser save the file.
 */
export class DownloadService {
  private readonly storage: SignedLinks;
  private readonly accounts: AccountService;

  constructor(storage: SignedLinks, accounts: AccountService) {
    this.storage = storage;
    this.accounts = accounts;
  }

  async link(userId: string, installer: InstallerId): Promise<DownloadLink> {
    const access = await this.accounts.downloadAccess(userId);
    if (!access?.allowed) throw new HttpError(403, messages.locked, undefined, { code: access?.reason ?? "none" });
    const fileName = installerFileName(installer, appInfo.version);
    const url = await this.storage.signedUrl(installerPath(fileName), DOWNLOAD_LINK_SECONDS, fileName);
    if (!url) throw new HttpError(503, messages.unavailable);
    return { installer, url, fileName, expiresIn: DOWNLOAD_LINK_SECONDS };
  }
}
