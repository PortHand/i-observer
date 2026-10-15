import "server-only";
import type { CustomerOrder, CustomerOrders, CustomerProfile } from "@/app/(view)/sview/profile/services/profileService";
import type { AccessSummary, DownloadAccess } from "@/app/(view)/sview/welcome/services/welcomeService";
import { hasAccess } from "@/server/features/entitlement/service/entitlementService";
import type { FeedbackService } from "@/server/features/feedback/service/feedbackService";
import { labelOrderLines } from "@/server/features/order/helper/orderLines";
import type { OrderRepository, OrderRow } from "@/server/features/order/repository/orderRepository";
import { paiseToRupees, type PricingService } from "@/server/features/pricing/service/pricingService";
import type { UserRow } from "@/server/features/user/repository/userRepository";
import type { UserService } from "@/server/features/user/service/userService";

/** The customer's access from the columns EntitlementService keeps on users. */
export const accessOf = (user: Pick<UserRow, "accessUntil" | "lifetimeAccess">, now = new Date()): AccessSummary => {
  if (user.lifetimeAccess) return { state: "lifetime", until: null };
  if (!user.accessUntil) return { state: "none", until: null };
  return { state: hasAccess(user, now) ? "active" : "expired", until: user.accessUntil.toISOString() };
};

/**
 * What a signed-in customer sees about themselves: their access, orders and feedback. Everything is
 * read by the session's user id, so a customer can only ever see their own.
 */
export class AccountService {
  private readonly users: UserService;
  private readonly orders: OrderRepository;
  private readonly pricing: PricingService;
  private readonly feedback: FeedbackService;

  constructor(users: UserService, orders: OrderRepository, pricing: PricingService, feedback: FeedbackService) {
    this.users = users;
    this.orders = orders;
    this.pricing = pricing;
    this.feedback = feedback;
  }

  /**
   * Whether this account may download the app. Admins always may; customers while they have access.
   * Otherwise says why not, so the page can explain: a payment being checked, expired, or none.
   */
  async downloadAccess(userId: string): Promise<DownloadAccess | null> {
    const user = await this.users.find(userId);
    if (!user) return null;
    if (user.role === "admin") return { allowed: true, reason: null, endedAt: null };
    const access = accessOf(user);
    if (access.state === "lifetime" || access.state === "active") return { allowed: true, reason: null, endedAt: null };
    const waiting = (await this.orders.listForUser(userId)).some((order) => order.status === "submitted");
    return { allowed: false, reason: waiting ? "waiting" : access.state, endedAt: access.until };
  }

  /** The profile page: account, plan and feedback. Null when the account no longer exists. */
  async profile(userId: string): Promise<CustomerProfile | null> {
    const user = await this.users.find(userId);
    if (!user) return null;
    const [rows, feedback] = await Promise.all([this.orders.listForUser(userId), this.feedback.list(userId)]);
    return {
      account: { email: user.email, phone: user.phone, role: user.role, memberSince: user.createdAt.toISOString() },
      access: accessOf(user),
      feedback,
      orderReferences: rows.map((row) => row.reference),
    };
  }

  /** The orders page: every order of the account with its lines, newest first. */
  async orderHistory(userId: string): Promise<CustomerOrders> {
    const rows = await this.orders.listForUser(userId);
    const lines = await labelOrderLines(this.pricing, await this.orders.findItemsFor(rows.map((row) => row.reference)));
    const toOrder = (row: OrderRow): CustomerOrder => ({
      reference: row.reference,
      status: row.status,
      amount: paiseToRupees(row.amountPaise),
      lines: lines.get(row.reference) ?? [],
      utr: row.utr,
      hasReceipt: row.receiptPath !== null,
      createdAt: row.createdAt.toISOString(),
      submittedAt: row.submittedAt?.toISOString() ?? null,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
    });
    return {
      orders: rows.map(toOrder),
      totalPaid: paiseToRupees(rows.filter((row) => row.status === "verified").reduce((total, row) => total + row.amountPaise, 0)),
    };
  }
}
