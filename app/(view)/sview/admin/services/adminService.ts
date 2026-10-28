// Shapes the admin portal shows, and its server calls. Reviews are Server Actions
// (server/features/order/action/orderReviewActions.ts), so there's no API route. The pages read
// orders on the server, straight from orderReviewService.

import type { OrderLine, Payee } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type { OrderStatus } from "@/server/features/order/schema/orderSchema";
import * as reviewActions from "@/server/features/order/action/orderReviewActions";
import * as appUpdateActions from "@/server/features/appUpdate/action/appUpdateActions";
import * as offerTimerActions from "@/server/features/offerTimer/action/offerTimerActions";
import * as pricingActions from "@/server/features/pricing/action/pricingActions";
import * as upiAccountActions from "@/server/features/pricing/action/upiAccountActions";
import type { AppUpdateInput } from "../helper/appUpdateHelper";
import type { OfferTimerInput } from "../helper/offerTimerHelper";
import type { PlanInput } from "../helper/planHelper";
import type { UpiAccountInput } from "../helper/upiHelper";

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

/** The desktop app's forced-update policy, as the admin portal shows it. */
export interface AppUpdatePolicyView {
  forceUpdate: boolean;
  /** Oldest version allowed while forceUpdate is on. */
  minimumVersion: string;
  /** Shown on the app's update screen; null for its default text. */
  message: string | null;
  /** When it was last saved (ISO), and by which admin; null when never saved. */
  updatedAt: string | null;
  updatedBy: string | null;
}

export type AppUpdateSaveResult = Awaited<ReturnType<typeof appUpdateActions.saveAppUpdatePolicy>>;

/** Saves the forced-update policy; apps pick it up on their next check. */
export const saveAppUpdatePolicy = (input: AppUpdateInput): Promise<AppUpdateSaveResult> => appUpdateActions.saveAppUpdatePolicy(input);

/**
 * Whether customers see a plan now: on sale; active but outside its sale window; active but with no
 * price in force; or switched off.
 */
export type AdminPlanStatus = "onSale" | "scheduled" | "noPrice" | "off";

/** A plan as the admin portal's Plans page shows and edits it. Amounts in rupees. */
export interface AdminPlanView {
  id: string;
  name: string;
  period: string;
  description: string;
  badge: string | null;
  /** At most one is set; both null: lifetime. */
  durationMonths: number | null;
  durationHours: number | null;
  sortOrder: number;
  maxQuantity: number;
  isDefault: boolean;
  active: boolean;
  /** Sale window (ISO); null for no limit on that side. */
  availableFrom: string | null;
  availableUntil: string | null;
  /** The normal price and its struck-through original; null when the plan has none. */
  price: number | null;
  compareAtPrice: number | null;
  /** A sale price added in the database that beats the normal price until `until` (ISO). */
  sale: { price: number; compareAtPrice: number | null; until: string } | null;
  status: AdminPlanStatus;
}

export type PlanSaveResult = Awaited<ReturnType<typeof pricingActions.savePlan>>;

export type PlanToggleResult = Awaited<ReturnType<typeof pricingActions.setPlanActive>>;

/** Turns a plan on or off for sale; returns every plan as saved. */
export const setPlanActive = (id: string, active: boolean): Promise<PlanToggleResult> => pricingActions.setPlanActive(id, active);

/** Adds a plan (`isNew`) or saves changes to one; returns every plan as saved. */
export const savePlan = (input: PlanInput, isNew: boolean): Promise<PlanSaveResult> => pricingActions.savePlan(input, isNew);

/** The website's offer countdown, as the admin portal shows it. */
export interface OfferTimerView {
  enabled: boolean;
  headline: string;
  /** The saved end time (ISO); null when never saved. */
  endsAt: string | null;
  durationHours: number;
  autoRestart: boolean;
  /** When the countdown customers see now reaches zero (ISO), after any restarts; null when none is shown. */
  nextEndsAt: string | null;
  /** When it was last saved (ISO), and by which admin; null when never saved. */
  updatedAt: string | null;
  updatedBy: string | null;
}

export type OfferTimerSaveResult = Awaited<ReturnType<typeof offerTimerActions.saveOfferTimer>>;

/** Saves the offer timer; with `reset`, the countdown starts again from now. Pages show it straight away. */
export const saveOfferTimer = (input: OfferTimerInput, reset: boolean): Promise<OfferTimerSaveResult> =>
  offerTimerActions.saveOfferTimer(input, reset);

/** A row of the upi_accounts table, as the admin portal shows it. */
export interface UpiAccountView {
  id: number;
  upiId: string;
  payeeName: string;
  /** New orders pay this account. At most one is active. */
  active: boolean;
  /** ISO. */
  updatedAt: string;
}

export type UpiAccountsResult = Awaited<ReturnType<typeof upiAccountActions.saveUpiAccount>>;

/** Adds an account (`id` null) or saves changes to one; returns every account as saved. */
export const saveUpiAccount = (id: number | null, input: UpiAccountInput): Promise<UpiAccountsResult> =>
  upiAccountActions.saveUpiAccount(id, input);

/** Turns an account on (switching off the one that was active) or off; returns every account as saved. */
export const setUpiAccountActive = (id: number, active: boolean): Promise<UpiAccountsResult> => upiAccountActions.setUpiAccountActive(id, active);

/** Deletes an inactive account; returns every account as saved. */
export const deleteUpiAccount = (id: number): Promise<UpiAccountsResult> => upiAccountActions.deleteUpiAccount(id);
