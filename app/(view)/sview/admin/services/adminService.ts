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
  /** The customer attached a payment screenshot. */
  hasReceipt: boolean;
  /** ISO timestamps. */
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  lines: OrderLine[];
  payee: Payee;
  reviewNote: string | null;
  /** The payment screenshot, if attached. `url` is a signed link that expires; null if it couldn't be made. */
  receipt: { url: string | null; fileName: string } | null;
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

/** The admin dashboard's figures. Months and days are counted in IST. */
export interface AdminDashboard {
  /** When the figures were read (ISO): ages such as "waiting 3 h" count from here. */
  asOf: string;
  counts: Record<StatusFilter, number>;
  /** When the longest-waiting submitted order was sent (ISO), or null when none wait. */
  oldestWaitingSince: string | null;
  /** Approved this month so far, and all of last month: rupees and order counts. */
  thisMonth: { amount: number; orders: number };
  lastMonth: { amount: number; orders: number };
  ordersToday: number;
  /** Oldest submitted orders first: the next ones to review. */
  queue: AdminOrderSummary[];
  /** Latest reviews, newest first. */
  recent: AdminOrderSummary[];
}

export type ReviewAction = "verify" | "reject" | "refund" | "resend";

export type ReviewResult = Awaited<ReturnType<typeof reviewActions.reviewOrder>>;

/** Approves, rejects or refunds an order, or emails a verified customer their login again. */
export const reviewOrder = (reference: string, action: ReviewAction, note: string): Promise<ReviewResult> =>
  reviewActions.reviewOrder(reference, action, note);
