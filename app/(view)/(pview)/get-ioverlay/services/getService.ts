// Server calls for the "Get iOverlay" page, plus the plan and order shapes the server sends. The
// calls are Server Actions (server/features/order/action/orderActions.ts), so there's no API route.

import * as orderActions from "@/server/features/order/action/orderActions";
import * as otpActions from "@/server/features/otp/action/otpActions";

export type PlanId = string;

/** A plan from the plans table, with its price now (plan_prices). Prices are edited in the database, not in code. */
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
  /** Most units of this plan one order may hold. */
  maxQuantity: number;
}

/** One plan in an order, and how many units of it. */
export interface OrderItemRequest {
  planId: PlanId;
  quantity: number;
}

export interface OrderRequest {
  /** One entry per plan; at least one. */
  items: OrderItemRequest[];
  email: string;
  /** 10-digit Indian mobile number without the country code. */
  phone: string;
}

/** Who the UPI QR code pays: the active account in the upi_accounts table when the order was saved. */
export interface Payee {
  upiId: string;
  name: string;
}

/** A line of a saved order, priced when the order was saved. */
export interface OrderLine extends OrderItemRequest {
  /** e.g. "iOverlay Monthly · 1 month × 2". */
  label: string;
  /** Rupees for the whole line (unit price × quantity). */
  amount: number;
}

export interface Order extends OrderRequest {
  /** Short code added to the UPI payment note so the payment can be matched to this order. */
  reference: string;
  items: OrderLine[];
  /** Every line's label, e.g. "iOverlay Yearly · 12 months" or "… + iOverlay Monthly · 1 month". */
  planLabel: string;
  /** Total in rupees, fixed when the order was saved, so a later price change doesn't affect it. */
  amount: number;
  payee: Payee;
}

/** Failures may name the fields at fault, e.g. { code: "That code isn't right. 2 tries left." }. */
type Failure = {
  ok: false;
  error: string;
  fields?: Partial<Record<string, string>>;
  /** Seconds to wait before retrying, on "too many requests". */
  retryAfter?: number;
  /** Machine-readable reason, e.g. VERIFICATION_REQUIRED (helper/getHelper.ts). */
  code?: string;
};

export type OrderResult = { ok: true; order: Order } | Failure;

/** sent: false means the latest code is still active and was kept (nothing was emailed). */
export type SendCodeResult = { ok: true; sent: boolean; resendAfter: number; expiresInMinutes: number } | Failure;

export type VerifyCodeResult = { ok: true; token: string } | Failure;

export interface TransactionRequest {
  reference: string;
  utr: string;
  /** Optional payment screenshot, PNG or JPG up to 5 MB. Stored privately for the admin to check. */
  screenshot: File | null;
}

export type SubmitTransactionResult =
  | { ok: true; submittedAt: string }
  | { ok: false; error: string };

/** Makes sure `email` has a working code: the server keeps an active one or emails a new one. `resend` forces a new one. */
export const sendEmailOtp = (email: string, resend = false): Promise<SendCodeResult> =>
  otpActions.sendEmailOtp(email, "checkout", resend);

/** Checks the code. The token it returns is passed to createOrder (and to updateOrder for a new email). */
export const verifyEmailOtp = (email: string, code: string): Promise<VerifyCodeResult> =>
  otpActions.verifyEmailOtp(email, "checkout", code);

/** Saves the order before the QR code is shown. The server issues the reference and fixes the price and payee. */
export const createOrder = (request: OrderRequest, emailToken: string | null): Promise<OrderResult> =>
  orderActions.createOrder(request, emailToken);

/** Changes the plans or contact details of an unpaid order. Keeps the reference; refreshes the prices and payee. */
export const updateOrder = (reference: string, request: OrderRequest, emailToken: string | null): Promise<OrderResult> =>
  orderActions.updateOrder(reference, request, emailToken);

/** Sends the UTR and screenshot. We check them against the bank statement and email the login. */
export const submitTransaction = ({ reference, utr, screenshot }: TransactionRequest): Promise<SubmitTransactionResult> =>
  orderActions.submitTransaction(reference, utr, screenshot);
