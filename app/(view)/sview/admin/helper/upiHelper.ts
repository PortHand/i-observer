import { UPI_PAYEE_NAME_MAX, upiPage } from "../content/adminContent";

/** "name@bank": a handle, then the bank's PSP handle. UPI IDs aren't case-sensitive, so they're kept lowercase. */
const UPI_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,63}@[a-z][a-z0-9.-]{1,31}$/;

export type UpiAccountField = "upiId" | "payeeName";

export interface UpiAccountInput {
  upiId: string;
  payeeName: string;
  /** Make it the account new orders pay. Not on the form: set for the first account added, so checkout has one. */
  active: boolean;
}

export type UpiAccountParse = { ok: true; input: UpiAccountInput } | { ok: false; errors: Partial<Record<UpiAccountField, string>> };

/** Checks the UPI account form. Used in the browser and again by the Server Action, so messages match. */
export const parseUpiAccountForm = (input: UpiAccountInput): UpiAccountParse => {
  const upiId = String(input.upiId ?? "").trim().toLowerCase();
  const payeeName = String(input.payeeName ?? "").trim().replace(/\s+/g, " ");

  const errors: Partial<Record<UpiAccountField, string>> = {};
  if (!UPI_ID_PATTERN.test(upiId)) errors.upiId = upiPage.errors.upiId;
  if (!payeeName) errors.payeeName = upiPage.errors.payeeNameMissing;
  else if (payeeName.length > UPI_PAYEE_NAME_MAX) errors.payeeName = upiPage.errors.payeeNameLong;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, input: { upiId, payeeName, active: input.active === true } };
};
