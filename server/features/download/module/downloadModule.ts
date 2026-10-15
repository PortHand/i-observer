// Wires the download feature together. The welcome page asks for links through the Server Action
// in action/downloadActions.ts.

import "server-only";
import { accountService } from "@/server/features/account/module/accountModule";
import { downloadStorage } from "@/server/features/storage/module/storageModule";
import { DownloadService } from "../service/downloadService";

export const downloadService = new DownloadService(downloadStorage, accountService);
