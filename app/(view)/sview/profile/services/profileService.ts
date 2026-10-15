// Shapes the profile and orders pages show, and their server calls. Feedback is a Server Action
// (server/features/feedback/action/feedbackActions.ts), so there's no API route. The page reads the
// data on the server, straight from accountService.

import type { OrderLine } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import * as feedbackActions from "@/server/features/feedback/action/feedbackActions";
import type { OrderStatus } from "@/server/features/order/schema/orderSchema";
import type { UserRole } from "@/server/features/user/schema/userSchema";
import type { AccessSummary } from "../../welcome/services/welcomeService";
import type { FeedbackTopic } from "../content/profileContent";
import type { FeedbackField, FeedbackInput } from "../helper/profileHelper";

export type { OrderStatus };

export interface CustomerOrder {
  reference: string;
  status: OrderStatus;
  /** Rupees. */
  amount: number;
  lines: OrderLine[];
  utr: string | null;
  hasReceipt: boolean;
  /** ISO timestamps. */
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface CustomerFeedback {
  id: string;
  rating: number;
  topic: FeedbackTopic;
  message: string;
  reference: string | null;
  /** ISO timestamp. */
  createdAt: string;
}

/** The profile page: account, plan and feedback. */
export interface CustomerProfile {
  account: { email: string; phone: string; role: UserRole; memberSince: string };
  access: AccessSummary;
  feedback: CustomerFeedback[];
  /** The customer's order references, newest first, for the feedback form's order picker. */
  orderReferences: string[];
}

/** The orders page. */
export interface CustomerOrders {
  orders: CustomerOrder[];
  /** Sum of approved orders, in rupees. */
  totalPaid: number;
}

export type SendFeedbackResult =
  | { ok: true; feedback: CustomerFeedback }
  | { ok: false; error: string; fields?: Partial<Record<FeedbackField, string>> };

/** Saves the feedback and tells the team. The server re-checks every field. */
export const sendFeedback = async (input: FeedbackInput): Promise<SendFeedbackResult> => {
  const body = new FormData();
  for (const [field, value] of Object.entries(input)) body.set(field, String(value));
  return (await feedbackActions.sendFeedback(body)) as SendFeedbackResult;
};
