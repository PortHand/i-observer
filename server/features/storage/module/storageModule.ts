// Wires the storage feature together. The order feature stores payment receipts with it; the
// download feature hands out links to the app installers; /api/intro-video links to site media.

import "server-only";
import { env } from "@/server/core/env";
import { S3Storage } from "../service/s3Storage";
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

const s3Downloads = new S3Storage(env.s3);

/**
 * The private bucket holding the app installers. Read only, through signed links. AWS S3 when
 * S3_BUCKET and its keys are set (installers are larger than Supabase's free upload limit);
 * otherwise the Supabase bucket SUPABASE_DOWNLOADS_BUCKET.
 */
export const downloadStorage = s3Downloads.configured
  ? s3Downloads
  : new StorageService({
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
