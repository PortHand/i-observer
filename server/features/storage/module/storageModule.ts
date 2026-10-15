// Wires the storage feature together. The order feature stores payment receipts with it.

import "server-only";
import { env } from "@/server/core/env";
import { StorageService } from "../service/storageService";

const { url, secretKey, receiptsBucket } = env.supabase;

/** The private bucket for payment screenshots (SUPABASE_RECEIPTS_BUCKET). */
export const receiptStorage = new StorageService({
  url,
  secretKey,
  bucket: receiptsBucket,
  optional: !env.isProduction,
});
