import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { isAvailableInstaller, isInstallerId } from "@/app/(view)/sview/welcome/helper/welcomeHelper";
import type { InstallCommands } from "@/app/(view)/sview/welcome/services/welcomeService";
import { routes } from "@/helper/route";
import { env } from "@/server/core/env";
import { HttpError } from "@/server/core/httpError";
import type { AccountService } from "@/server/features/account/service/accountService";
import type { InstallTokenRepository } from "../repository/installTokenRepository";
import { macInstallCommand, windowsInstallCommand } from "../script/installScripts";
import type { DownloadService } from "./downloadService";

/** How long an install command works, in seconds, if it isn't used first. */
export const INSTALL_TOKEN_SECONDS = 15 * 60;

/** Prefix of every install token, so one pasted somewhere is recognisable. */
const TOKEN_PREFIX = "iov_";

const messages = {
  locked: "Your download unlocks once you have an active plan.",
  missing: "No install code was sent. Copy the full command from your welcome page.",
  invalid: "This install command has expired or was already used. Get a new one from {page} and run it again.",
  installer: "This installer isn't available.",
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * The welcome page's Terminal install commands. Each holds a one-time token tied to the account:
 * the install script sends it to /api/install/link, which spends it and answers with a short-lived
 * download link (DownloadService). A token works once, for INSTALL_TOKEN_SECONDS, and only while
 * the account still has access; making a new command cancels the account's unused ones.
 */
export class InstallService {
  private readonly tokens: InstallTokenRepository;
  private readonly downloads: DownloadService;
  private readonly accounts: AccountService;

  constructor(tokens: InstallTokenRepository, downloads: DownloadService, accounts: AccountService) {
    this.tokens = tokens;
    this.downloads = downloads;
    this.accounts = accounts;
  }

  async commands(userId: string): Promise<InstallCommands> {
    const access = await this.accounts.downloadAccess(userId);
    if (!access?.allowed) throw new HttpError(403, messages.locked, undefined, { code: access?.reason ?? "none" });
    const token = `${TOKEN_PREFIX}${randomBytes(24).toString("base64url")}`;
    await this.tokens.replace(userId, hashToken(token), new Date(Date.now() + INSTALL_TOKEN_SECONDS * 1000));
    return {
      mac: macInstallCommand(env.siteUrl, token),
      windows: windowsInstallCommand(env.siteUrl, token),
      expiresIn: INSTALL_TOKEN_SECONDS,
    };
  }

  /** Spends the token and returns a download link to `installer`. Throws an HttpError the script prints. */
  async redeem(token: string | undefined, installer: string | null): Promise<string> {
    if (!token?.startsWith(TOKEN_PREFIX)) throw HttpError.unauthorized(messages.missing);
    if (!isInstallerId(installer) || !isAvailableInstaller(installer)) throw HttpError.badRequest(messages.installer);
    const userId = await this.tokens.redeem(hashToken(token));
    if (!userId) throw HttpError.unauthorized(messages.invalid.replace("{page}", `${env.siteUrl}${routes.welcome}`));
    // Checks the plan again: it may have ended since the command was made.
    const link = await this.downloads.link(userId, installer);
    return link.url;
  }
}
