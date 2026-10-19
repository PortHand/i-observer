// Wires the storage feature together. The order feature stores payment receipts with it; the
// download feature hands out links to the app installers; /api/intro-video links to site media.

import "server-only";
import { env } from "@/server/core/env";
import { StorageService } from "../service/storageService";

const { url, secretKey, receiptsBucket, downloadsBucket, assetsBucket } = env.supabase;

// TO_TEST=true in .env: receipts are printed to the server log instead of being uploaded.
const testMode = env.toTest;
if (testMode && env.isProduction) {
  console.warn("[storage] TO_TEST is on in production: payment screenshots are logged, not stored. Turn it off before going live.");
}

/** The private bucket for payment screenshots (SUPABASE_RECEIPTS_BUCKET). */
export const receiptStorage = new StorageService({
  url,
  secretKey,
  bucket: receiptsBucket,
  optional: !env.isProduction,
  testMode,
});

/** The private bucket holding the app installers (SUPABASE_DOWNLOADS_BUCKET). Read only, through signed links. */
export const downloadStorage = new StorageService({
  url,
  secretKey,
  bucket: downloadsBucket,
  optional: !env.isProduction,
  testMode: false,
});

/** The private bucket holding site media under assets/ (SUPABASE_ASSETS_BUCKET). Read only, through signed links. */
export const assetStorage = new StorageService({
  url,
  secretKey,
  bucket: assetsBucket,
  optional: !env.isProduction,
  testMode: false,
});
