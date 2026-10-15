// Shapes the admin portal shows, and its server calls. Reviews are Server Actions
// (server/features/order/action/orderReviewActions.ts), so there's no API route. The pages read
// orders on the server, straight from orderReviewService.

import type { OrderLine, Payee } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type { OrderStatus } from "@/server/features/order/schema/orderSchema";
import * as reviewActions from "@/server/features/order/action/orderReviewActions";

export type { OrderStatus };

/** One row of the order list. */
export interface AdminOrderSummary {
  reference: string;
  email: string;
  phone: string;
  status: OrderStatus;
  /** Rupees. */
  amount: number;
  /** Every line's label, e.g. "iOverlay Yearly · 12 months". */
  planLabel: string;
  utr: string | null;
  /** ISO timestamps. */
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  lines: OrderLine[];
  payee: Payee;
  reviewNote: string | null;
  /** The customer's account. Null on orders saved before accounts existed. */
  customer: { username: string; accessUntil: string | null; lifetimeAccess: boolean } | null;
}

/** Filter "all" lists every status. */
export type StatusFilter = OrderStatus | "all";

export interface AdminOrderPage {
  orders: AdminOrderSummary[];
  /** Orders matching the search, per status and in total. */
  counts: Record<StatusFilter, number>;
  /** 1-based. */
  page: number;
  pageCount: number;
}

export type ReviewAction = "verify" | "reject" | "refund" | "resend";

export type ReviewResult = Awaited<ReturnType<typeof reviewActions.reviewOrder>>;

/** Approves, rejects or refunds an order, or emails a verified customer their login again. */
export const reviewOrder = (reference: string, action: ReviewAction, note: string): Promise<ReviewResult> =>
  reviewActions.reviewOrder(reference, action, note);
