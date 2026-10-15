import "server-only";

/** Same limit as the checkout form (getHelper.ts). */
const MAX_BYTES = 5 * 1024 * 1024;

export interface ReceiptFile {
  bytes: Uint8Array;
  contentType: "image/png" | "image/jpeg";
  extension: "png" | "jpg";
}

/** India has no daylight saving, so a fixed offset gives the IST date. */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * The screenshot as sent, checked by its first bytes rather than its name or the type the browser
 * claims: only real PNG and JPEG images up to 5 MB. Null when nothing was attached; throws `invalid`
 * for anything else.
 */
export const readReceipt = async (file: unknown, invalid: () => Error): Promise<ReceiptFile | null> => {
  if (file === null || file === undefined) return null;
  if (!(file instanceof Blob)) throw invalid();
  if (file.size === 0) return null;
  if (file.size > MAX_BYTES) throw invalid();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { bytes, contentType: "image/png", extension: "png" };
  if (starts(0xff, 0xd8, 0xff)) return { bytes, contentType: "image/jpeg", extension: "jpg" };
  throw invalid();
};

/** A folder name from the email: lower-case letters, digits and @ . _ - only. */
const folderFor = (email: string) => email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");

/** Where a receipt goes in the bucket: client/<email>/<utr>_<YYYY-MM-DD>.<ext>, the date in IST. */
export const receiptPath = (email: string, utr: string, extension: string, at = new Date()) => {
  const date = new Date(at.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
  return `client/${folderFor(email)}/${utr}_${date}.${extension}`;
};
