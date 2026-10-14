// Server calls for the "Get iOverlay" page, plus the plan and order shapes the server sends. The
// calls are Server Actions (server/features/order/action/orderActions.ts), so there's no API route.

import * as orderActions from "@/server/features/order/action/orderActions";

export type PlanId = string;

/** A plan from the plans table. Prices are edited in the database, not in code. */
export interface Plan {
  id: PlanId;
  name: string;
  /** Amount in rupees, paid once by UPI. */
  amount: number;
  period: string;
  description: string;
  badge: string | null;
  /** Pre-selected at checkout. */
  isDefault: boolean;
}

export interface OrderRequest {
  planId: PlanId;
  email: string;
  /** 10-digit Indian mobile number without the country code. */
  phone: string;
}

/** Who the UPI QR code pays: the active account in the upi_accounts table when the order was saved. */
export interface Payee {
  upiId: string;
  name: string;
}

export interface Order extends OrderRequest {
  /** Short code added to the UPI payment note so the payment can be matched to this order. */
  reference: string;
  /** e.g. "iOverlay Yearly · 12 months". */
  planLabel: string;
  /** Rupees, fixed when the order was saved, so a later price change doesn't affect it. */
  amount: number;
  payee: Payee;
}

export type OrderResult = { ok: true; order: Order } | { ok: false; error: string };

export interface TransactionRequest {
  reference: string;
  utr: string;
}

export type SubmitTransactionResult =
  | { ok: true; submittedAt: string }
  | { ok: false; error: string };

/** Saves the order before the QR code is shown. The server issues the reference and fixes the price and payee. */
export const createOrder = (request: OrderRequest): Promise<OrderResult> => orderActions.createOrder(request);

/** Changes the plan or contact details of an unpaid order. Keeps the reference; refreshes the price and payee. */
export const updateOrder = (reference: string, request: OrderRequest): Promise<OrderResult> =>
  orderActions.updateOrder(reference, request);

/** Sends the UTR. We check it against the bank statement and email the login. */
// TODO: upload the payment screenshot too, once it has somewhere to go (a private storage bucket).
export const submitTransaction = ({ reference, utr }: TransactionRequest): Promise<SubmitTransactionResult> =>
  orderActions.submitTransaction(reference, utr);
