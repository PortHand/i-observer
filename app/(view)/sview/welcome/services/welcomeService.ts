// Shapes the welcome page shows, and its server calls. Download links come from a Server Action
// (server/features/download/action/downloadActions.ts), so there's no API route.

import * as downloadActions from "@/server/features/download/action/downloadActions";
import type { InstallerId } from "../content/welcomeContent";

/** lifetime / active: can download. expired: had time that ran out. none: never had a verified plan. */
export type AccessState = "lifetime" | "active" | "expired" | "none";

export interface AccessSummary {
  state: AccessState;
  /** End of paid time (ISO), or null for lifetime and for none. */
  until: string | null;
}

/** Whether this account may download, and if not, why. */
export interface DownloadAccess {
  allowed: boolean;
  /** Why it's locked: a payment is being checked, nothing was bought, or the time ran out. */
  reason: "waiting" | "none" | "expired" | null;
  /** When access ended (ISO), for "expired". */
  endedAt: string | null;
}

export interface DownloadLink {
  installer: InstallerId;
  /** Signed link to the private file; it stops working `expiresIn` seconds after it was made. */
  url: string;
  fileName: string;
  /** Seconds, rather than a time, so a wrong clock on the visitor's computer doesn't matter. */
  expiresIn: number;
}

export type DownloadLinkResult = Awaited<ReturnType<typeof downloadActions.getDownloadLink>>;

/** A fresh, short-lived link to this installer. */
export const getDownloadLink = (installer: InstallerId): Promise<DownloadLinkResult> => downloadActions.getDownloadLink(installer);
