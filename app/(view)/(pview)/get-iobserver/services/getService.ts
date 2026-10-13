// API calls for the "Get iObserver" page. There is no backend yet, so these are placeholders:
// they succeed locally without sending anything. Replace them before taking real payments.

import type { PlanId } from "../content/getContent";

export interface OrderRequest {
  planId: PlanId;
  email: string;
  /** 10-digit Indian mobile number without the country code. */
  phone: string;
}

export interface Order extends OrderRequest {
  /** Short code added to the UPI payment note so the payment can be matched to this order. */
  reference: string;
}

export type CreateOrderResult = { ok: true; order: Order } | { ok: false; error: string };

export interface TransactionRequest {
  reference: string;
  utr: string;
  screenshot: File | null;
}

export type SubmitTransactionResult =
  | { ok: true; submittedAt: string }
  | { ok: false; error: string };

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const makeReference = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length]).join("");
  return `IOB-${code}`;
};

/** Saves the plan and contact details before the QR code is shown, so we can follow up on unfinished payments. */
export const createOrder = async (request: OrderRequest): Promise<CreateOrderResult> => {
  // TODO: replace with a call to the real orders API, which should issue the reference and own the price.
  return { ok: true, order: { ...request, reference: makeReference() } };
};

/** Sends the UTR and optional screenshot. The backend verifies the payment and emails the login. */
export const submitTransaction = async ({
  reference,
  utr,
  screenshot,
}: TransactionRequest): Promise<SubmitTransactionResult> => {
  // TODO: replace with a multipart upload to the real orders API.
  void reference;
  void utr;
  void screenshot;
  return { ok: true, submittedAt: new Date().toISOString() };
};
