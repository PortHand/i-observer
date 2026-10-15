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
import type { OrderItemRequest, OrderRequest } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { assertValid, runAction } from "@/server/core/baseAction";
import type { FieldErrors } from "@/server/core/httpError";
import { orderService } from "../module/orderModule";

/** More lines than any order needs, so a bad request can't make the server look up hundreds of plans. */
const MAX_ORDER_LINES = 10;

/** The lines as sent, or null when they aren't a list of 1 to MAX_ORDER_LINES entries. */
const readItems = (input: unknown): OrderItemRequest[] | null => {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_ORDER_LINES) return null;
  return input.map((item: Partial<OrderItemRequest> | null) => ({
    planId: String(item?.planId ?? ""),
    quantity: Number(item?.quantity ?? 1),
  }));
};

/** Same checks and messages as the form in the browser. The plans themselves are checked by the service. */
const readOrder = (input: OrderRequest): OrderRequest => {
  const items = readItems(input?.items);
  const email = String(input?.email ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(input?.phone ?? ""));
  const { contact } = checkout;

  const fields: FieldErrors = {};
  if (!items || items.some((item) => !item.planId)) fields.items = contact.planMissing;
  else if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) fields.items = contact.invalidQuantity;
  else if (new Set(items.map((item) => item.planId)).size !== items.length) fields.items = contact.planRepeated;
  if (!isValidEmail(email)) fields.email = contact.invalidEmail;
  if (!isValidPhone(phone)) fields.phone = contact.invalidPhone;
  assertValid(fields);
  return { items: items!, email, phone };
};

const readToken = (token: unknown) => (typeof token === "string" && token ? token : null);

/**
 * Saves the order with each plan's current price and the active UPI account, before the QR code is
 * shown. `emailToken` comes from verifyEmailOtp for the same email.
 */
export async function createOrder(input: OrderRequest, emailToken: string | null) {
  return runAction(async () => ({ order: await orderService.create(readOrder(input), readToken(emailToken)) }));
}

/** Changes the plans or contact details of an unpaid order. Changing the email needs a fresh `emailToken`. */
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
