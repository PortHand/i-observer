// Server calls for the "Get iOverlay" page, plus the plan and order shapes the server sends. The
// calls are Server Actions (server/features/order/action/orderActions.ts), so there's no API route.

import * as orderActions from "@/server/features/order/action/orderActions";
import * as otpActions from "@/server/features/otp/action/otpActions";

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

/** Changes the plan or contact details of an unpaid order. Keeps the reference; refreshes the price and payee. */
export const updateOrder = (reference: string, request: OrderRequest, emailToken: string | null): Promise<OrderResult> =>
  orderActions.updateOrder(reference, request, emailToken);

/** Sends the UTR. We check it against the bank statement and email the login. */
// TODO: upload the payment screenshot too, once it has somewhere to go (a private storage bucket).
export const submitTransaction = ({ reference, utr }: TransactionRequest): Promise<SubmitTransactionResult> =>
  orderActions.submitTransaction(reference, utr);
