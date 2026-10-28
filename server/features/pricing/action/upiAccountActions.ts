"use server";

// Server Actions for the admin portal's UPI accounts page. Anyone can call a Server Action, so each
// checks the admin role on the server before doing anything. Checkout reads the active account
// fresh for every order, so there's no cache to expire.

import { parseUpiAccountForm, type UpiAccountInput } from "@/app/(view)/sview/admin/helper/upiHelper";
import { runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { pricingService } from "../module/pricingModule";

/** A row id from the browser: a positive whole number, or null for none. */
const toId = (id: unknown) => (typeof id === "number" && Number.isInteger(id) && id > 0 ? id : null);

/** Adds an account (`id` null) or saves changes to one, then returns every account as saved. */
export async function saveUpiAccount(id: number | null, input: UpiAccountInput) {
  return runAction(async () => {
    await assertAdmin();
    // Same checks and messages as the form in the browser.
    const parsed = parseUpiAccountForm(input ?? { upiId: "", payeeName: "", active: false });
    if (!parsed.ok) throw HttpError.badRequest("Some details need fixing.", parsed.errors);
    await pricingService.saveUpiAccount(id === null ? null : (toId(id) ?? -1), parsed.input);
    return { accounts: await pricingService.upiAccounts() };
  });
}

/** Turns an account on (switching off the one that was active) or off, then returns every account as saved. */
export async function setUpiAccountActive(id: number, active: boolean) {
  return runAction(async () => {
    await assertAdmin();
    await pricingService.setUpiAccountActive(toId(id) ?? -1, active === true);
    return { accounts: await pricingService.upiAccounts() };
  });
}

/** Deletes an account that isn't active, then returns every account as saved. */
export async function deleteUpiAccount(id: number) {
  return runAction(async () => {
    await assertAdmin();
    await pricingService.deleteUpiAccount(toId(id) ?? -1);
    return { accounts: await pricingService.upiAccounts() };
  });
}
