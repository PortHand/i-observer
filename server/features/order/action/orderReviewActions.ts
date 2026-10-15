"use server";

// Server Actions for the admin portal's payment reviews. Anyone can call a Server Action, so each
// one checks the admin role on the server before doing anything.

import type { ReviewAction } from "@/app/(view)/sview/admin/services/adminService";
import { assertValid, runAction } from "@/server/core/baseAction";
import { assertAdmin } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "../module/orderModule";

const ACTIONS: ReviewAction[] = ["verify", "reject", "refund", "resend"];

/** Longest review note kept with the order. */
const MAX_NOTE = 500;

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
