// Wires the download feature together. The welcome page asks for links and install commands
// through the Server Actions in action/downloadActions.ts; install scripts redeem their command's
// token at app/api/install/link.

import "server-only";
import { accountService } from "@/server/features/account/module/accountModule";
import { downloadStorage } from "@/server/features/storage/module/storageModule";
import { InstallTokenRepository } from "../repository/installTokenRepository";
import { DownloadService } from "../service/downloadService";
import { InstallService } from "../service/installService";

export const downloadService = new DownloadService(downloadStorage, accountService);

export const installService = new InstallService(new InstallTokenRepository(), downloadService, accountService);
