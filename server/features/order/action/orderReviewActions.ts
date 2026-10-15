"use server";

// Server Actions for the admin portal's payment reviews. Anyone can call a Server Action, so each
// one checks the admin role on the server before doing anything.

import type { DashboardRange, ReviewAction, StatusFilter } from "@/app/(view)/sview/admin/services/adminService";
import { assertValid, runAction } from "@/server/core/baseAction";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "../module/orderModule";
import { ORDER_STATUSES } from "../service/orderReviewService";

const ACTIONS: ReviewAction[] = ["verify", "reject", "refund", "resend"];

/** Longest review note kept with the order. */
const MAX_NOTE = 500;

const FILTERS: StatusFilter[] = [...ORDER_STATUSES, "all"];

/** Days the dashboard can look back over (the same as DASHBOARD_RANGES, kept here as values for a "use server" file). */
const RANGES: DashboardRange[] = [7, 30, 90];

/** Search text longer than this is cut, so a pasted essay can't become a huge query. */
const MAX_SEARCH = 100;

/**
 * Verifies, rejects or refunds an order's payment, or emails a verified customer their login
 * again. `note` is saved with the review (not on resend) and shown only to admins.
 */
export async function reviewOrder(reference: string, action: ReviewAction, note: string) {
  return runAction(async () => {
    await assertAdmin();
    const text = String(note ?? "").trim();
    assertValid({
      ...(!ACTIONS.includes(action) && { action: "Unknown review action." }),
      ...(text.length > MAX_NOTE && { note: `Keep the note under ${MAX_NOTE} characters.` }),
    });
    return { outcome: await orderReviewService.review(String(reference ?? ""), action, text || null) };
  });
}

/**
 * One page of the order list for the admin portal's in-page search, tabs and paging, so the list
 * can change without a page load. Unknown statuses fall back to "submitted", bad pages to 1.
 */
export async function listOrders(status: StatusFilter, search: string, page: number) {
  return runAction(async () => {
    await assertAdmin();
    const filter = FILTERS.includes(status) ? status : "submitted";
    const text = String(search ?? "").trim().slice(0, MAX_SEARCH);
    const number = Number.isInteger(page) && page > 0 ? page : 1;
    return { list: await orderReviewService.list(filter, text, number) };
  });
}

/** The admin dashboard's figures over the last `range` days, so the period can change without a page load. */
export async function loadDashboard(range: DashboardRange) {
  return runAction(async () => {
    await assertAdmin();
    const days = RANGES.includes(range) ? range : 30;
    return { dashboard: await orderReviewService.dashboard(days) };
  });
}
