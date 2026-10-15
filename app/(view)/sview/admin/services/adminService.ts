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
  /** The same labels one per line, for lists that show them separately. */
  plans: string[];
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
  /** When the list was read (ISO): waiting times count from here. */
  asOf: string;
  orders: AdminOrderSummary[];
  /** Orders matching the search, per status and in total. */
  counts: Record<StatusFilter, number>;
  /** 1-based. */
  page: number;
  pageCount: number;
  pageSize: number;
}

/** Days the dashboard can look back over. */
export const DASHBOARD_RANGES = [7, 30, 90] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

/** One IST day of the dashboard's trend. */
export interface DashboardDay {
  /** "YYYY-MM-DD", in IST. */
  day: string;
  /** Orders placed that day. */
  orders: number;
  /** Payments approved that day: how many, and their total in rupees. */
  approved: number;
  revenue: number;
}

/** A figure for the dashboard's range, and the same figure for the range just before it. */
export interface Period {
  current: number;
  previous: number;
}

/**
 * The admin dashboard's figures. Days are counted in IST; "the range" is the last `range` days,
 * today included, and "previous" is the same number of days just before it.
 */
export interface AdminDashboard {
  /** When the figures were read (ISO): ages such as "waiting 3 h" count from here. */
  asOf: string;
  range: DashboardRange;
  /** Orders per status, all time. */
  counts: Record<StatusFilter, number>;
  /** When the longest-waiting submitted order was sent (ISO), or null when none wait. */
  oldestWaitingSince: string | null;
  /** Approved payments in the range: rupees, and how many. */
  revenue: Period;
  approved: Period;
  /** Orders placed in the range, and how many of those the customer paid (sent a UTR). */
  orders: Period;
  paid: number;
  ordersToday: number;
  /** Payments decided in the range, and the mean time from UTR to decision in seconds (null when none). */
  decisions: { approved: number; rejected: number; avgSeconds: number | null };
  /** One entry per day of the range, oldest first. */
  daily: DashboardDay[];
  /** Oldest submitted orders first: the next ones to review. */
  queue: AdminOrderSummary[];
  /** Latest reviews, newest first. */
  recent: AdminOrderSummary[];
}

export type ReviewAction = "verify" | "reject" | "refund" | "resend";

export type ReviewResult = Awaited<ReturnType<typeof reviewActions.reviewOrder>>;

export type ListResult = Awaited<ReturnType<typeof reviewActions.listOrders>>;

export type DashboardResult = Awaited<ReturnType<typeof reviewActions.loadDashboard>>;

/** Approves, rejects or refunds an order, or emails a verified customer their login again. */
export const reviewOrder = (reference: string, action: ReviewAction, note: string): Promise<ReviewResult> =>
  reviewActions.reviewOrder(reference, action, note);

/** One page of orders in this status (or all) matching `search`, read without a page load. */
export const listOrders = (status: StatusFilter, search: string, page: number): Promise<ListResult> =>
  reviewActions.listOrders(status, search, page);

/** The dashboard's figures over the last `range` days, read without a page load. */
export const loadDashboard = (range: DashboardRange): Promise<DashboardResult> => reviewActions.loadDashboard(range);
