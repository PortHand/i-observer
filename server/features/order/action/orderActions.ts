"use server";

// Server Actions for the checkout, called straight from the page's service (no app/api route).

import { checkout } from "@/app/(view)/(pview)/get-ioverlay/content/getContent";
import {
  isValidEmail,
  isValidPhone,
  isValidUtr,
  normalizePhone,
  normalizeUtr,
} from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { OrderRequest } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { assertValid, runAction } from "@/server/core/baseAction";
import type { FieldErrors } from "@/server/core/httpError";
import { orderService } from "../module/orderModule";

/** Same checks and messages as the form in the browser. The plan itself is checked by the service. */
const readOrder = (input: OrderRequest): OrderRequest => {
  const planId = String(input?.planId ?? "");
  const email = String(input?.email ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(input?.phone ?? ""));
  const { contact } = checkout;

  const fields: FieldErrors = {};
  if (!planId) fields.planId = contact.planMissing;
  if (!isValidEmail(email)) fields.email = contact.invalidEmail;
  if (!isValidPhone(phone)) fields.phone = contact.invalidPhone;
  assertValid(fields);
  return { planId, email, phone };
};

const readToken = (token: unknown) => (typeof token === "string" && token ? token : null);

/**
 * Saves the order with the plan's current price and the active UPI account, before the QR code is
 * shown. `emailToken` comes from verifyEmailOtp for the same email.
 */
export async function createOrder(input: OrderRequest, emailToken: string | null) {
  return runAction(async () => ({ order: await orderService.create(readOrder(input), readToken(emailToken)) }));
}

/** Changes the plan or contact details of an unpaid order. Changing the email needs a fresh `emailToken`. */
export async function updateOrder(reference: string, input: OrderRequest, emailToken: string | null) {
  return runAction(async () => ({
    order: await orderService.update(String(reference), readOrder(input), readToken(emailToken)),
  }));
}

/** Records the customer's UTR, so the payment can be checked against the bank statement. */
export async function submitTransaction(reference: string, utr: string) {
  return runAction(async () => {
    const normalized = normalizeUtr(String(utr ?? ""));
    assertValid(isValidUtr(normalized) ? {} : { utr: checkout.transaction.invalidUtr });
    return orderService.submit(String(reference), normalized);
  });
}
