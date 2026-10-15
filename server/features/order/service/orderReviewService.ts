import "server-only";
import { formatAmount, orderLabel, orderLineLabel } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { OrderLine } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type {
  AdminDashboard,
  AdminOrderDetail,
  AdminOrderPage,
  AdminOrderSummary,
  ReviewAction,
  StatusFilter,
} from "@/app/(view)/sview/admin/services/adminService";
import { HttpError } from "@/server/core/httpError";
import type { MailService } from "@/server/features/mail/service/mailService";
import { paiseToRupees, type PricingService } from "@/server/features/pricing/service/pricingService";
import type { UserService } from "@/server/features/user/service/userService";
import type { OrderItemRow, OrderRepository, OrderRow } from "../repository/orderRepository";
import type { OrderStatus } from "../schema/orderSchema";
import { paymentRejectedTemplate } from "../template/paymentRejectedTemplate";
import { paymentVerifiedTemplate } from "../template/paymentVerifiedTemplate";
import type { OrderService } from "./orderService";

export const ORDER_STATUSES: OrderStatus[] = ["submitted", "pending", "verified", "rejected", "refunded"];

const PAGE_SIZE = 25;

/** Rows in each dashboard panel. */
const PANEL_SIZE = 5;

/** India has no daylight saving, so a fixed offset finds IST midnights. */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/** IST midnight starting today, this month and last month, as instants. */
const istPeriods = (now: Date) => {
  const local = new Date(now.getTime() + IST_OFFSET_MS);
  const [year, month, day] = [local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()];
  const at = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d) - IST_OFFSET_MS);
  return { today: at(year, month, day), thisMonth: at(year, month, 1), lastMonth: at(year, month - 1, 1) };
};

/** What happened after a review: the order's new status, and whether the customer was emailed. */
export interface ReviewOutcome {
  reference: string;
  status: OrderStatus;
  /** null: this action sends no email (refund). false: the email failed; see the server log. */
  emailed: boolean | null;
}

const notFound = (reference: string) => HttpError.notFound(`There's no order ${reference}.`);

/**
 * The admin portal's view of orders: lists them, and verifies, rejects or refunds payments through
 * OrderService, emailing the customer the outcome. Callers check the admin role first.
 */
export class OrderReviewService {
  private readonly orders: OrderRepository;
  private readonly orderService: OrderService;
  private readonly pricing: PricingService;
  private readonly users: UserService;
  private readonly mail: MailService;

  constructor(orders: OrderRepository, orderService: OrderService, pricing: PricingService, users: UserService, mail: MailService) {
    this.orders = orders;
    this.orderService = orderService;
    this.pricing = pricing;
    this.users = users;
    this.mail = mail;
  }

  /** Orders per status, and in total, matching `search` (all orders without one). */
  async counts(search?: string): Promise<AdminOrderPage["counts"]> {
    const byStatus = await this.orders.countByStatus(search || undefined);
    const counts = Object.fromEntries(ORDER_STATUSES.map((value) => [value, byStatus[value] ?? 0])) as AdminOrderPage["counts"];
    counts.all = ORDER_STATUSES.reduce((total, value) => total + counts[value], 0);
    return counts;
  }

  /** Everything the admin dashboard shows, in one round of queries. */
  async dashboard(now = new Date()): Promise<AdminDashboard> {
    const periods = istPeriods(now);
    const [counts, thisMonth, lastMonth, ordersToday, queueRows, recentRows] = await Promise.all([
      this.counts(),
      this.orders.verifiedBetween(periods.thisMonth),
      this.orders.verifiedBetween(periods.lastMonth, periods.thisMonth),
      this.orders.countCreatedSince(periods.today),
      this.orders.list({ status: "submitted" }, PANEL_SIZE, 0),
      this.orders.recentlyReviewed(PANEL_SIZE),
    ]);
    const lines = await this.toLines(await this.orders.findItemsFor([...queueRows, ...recentRows].map((row) => row.reference)));
    const summary = (row: OrderRow) => this.toSummary(row, lines.get(row.reference) ?? []);
    const money = ({ orders, paise }: { orders: number; paise: number }) => ({ orders, amount: paiseToRupees(paise) });
    return {
      asOf: now.toISOString(),
      counts,
      oldestWaitingSince: queueRows[0]?.submittedAt?.toISOString() ?? null,
      thisMonth: money(thisMonth),
      lastMonth: money(lastMonth),
      ordersToday,
      queue: queueRows.map(summary),
      recent: recentRows.map(summary),
    };
  }

  /** One page of orders with this status (or all), matching `search`, plus the count per status. */
  async list(status: StatusFilter, search: string, page: number): Promise<AdminOrderPage> {
    const filter = { status: status === "all" ? undefined : status, search: search || undefined };
    const counts = await this.counts(filter.search);

    const pageCount = Math.max(1, Math.ceil(counts[status] / PAGE_SIZE));
    const current = Math.min(Math.max(1, page), pageCount);
    const rows = await this.orders.list(filter, PAGE_SIZE, (current - 1) * PAGE_SIZE);
    const lines = await this.toLines(await this.orders.findItemsFor(rows.map((row) => row.reference)));
    return {
      orders: rows.map((row) => this.toSummary(row, lines.get(row.reference) ?? [])),
      counts,
      page: current,
      pageCount,
    };
  }

  async detail(reference: string): Promise<AdminOrderDetail | null> {
    const row = await this.orders.find(reference);
    if (!row) return null;
    const lines = (await this.toLines(await this.orders.findItems(reference))).get(reference) ?? [];
    const user = row.userId ? await this.users.find(row.userId) : null;
    return {
      ...this.toSummary(row, lines),
      lines,
      payee: { upiId: row.upiId, name: row.payeeName },
      reviewNote: row.reviewNote,
      customer: user && {
        username: user.username,
        accessUntil: user.accessUntil?.toISOString() ?? null,
        lifetimeAccess: user.lifetimeAccess,
      },
    };
  }

  /**
   * verify: the payment is on the bank statement; grants access and emails the login.
   * reject: no matching payment; emails the customer. refund: the money went back; takes the
   * access away (no email). resend: emails a verified customer their login again.
   */
  async review(reference: string, action: ReviewAction, note: string | null): Promise<ReviewOutcome> {
    const row = await this.orders.find(reference);
    if (!row) throw notFound(reference);
    if (action === "resend") {
      if (row.status !== "verified") throw HttpError.conflict(`Order ${reference} is ${row.status}; only verified orders have a login to send.`);
      return { reference, status: row.status, emailed: await this.emailOutcome(reference) };
    }
    const result =
      action === "verify"
        ? await this.orderService.verify(reference, note)
        : action === "reject"
          ? await this.orderService.reject(reference, note)
          : await this.orderService.refund(reference, note);
    // The review is saved; a failed email is reported to the admin rather than undoing it.
    const emailed = action === "refund" ? null : await this.emailOutcome(reference);
    return { ...result, emailed };
  }

  /** Emails the customer their order's outcome. False (and logged) when sending fails. */
  private async emailOutcome(reference: string): Promise<boolean> {
    try {
      const detail = await this.detail(reference);
      if (!detail) throw notFound(reference);
      const data = { reference, planLabel: detail.planLabel, amount: formatAmount(detail.amount), utr: detail.utr };
      if (detail.status === "verified") {
        const row = await this.orders.find(reference);
        const user = row?.userId ? await this.users.find(row.userId) : null;
        if (!user) throw new Error(`Order ${reference} has no account to send a login for.`);
        const login = { ...data, username: user.username, password: user.password };
        await this.mail.sendTemplate(paymentVerifiedTemplate, login, { to: detail.email });
      } else {
        await this.mail.sendTemplate(paymentRejectedTemplate, data, { to: detail.email });
      }
      return true;
    } catch (error) {
      console.error(`[order-review] ${reference}: couldn't email the customer.`, error);
      return false;
    }
  }

  private toSummary(row: OrderRow, lines: OrderLine[]): AdminOrderSummary {
    return {
      reference: row.reference,
      email: row.email,
      phone: row.phone,
      status: row.status,
      amount: paiseToRupees(row.amountPaise),
      planLabel: orderLabel(lines),
      utr: row.utr,
      createdAt: row.createdAt.toISOString(),
      submittedAt: row.submittedAt?.toISOString() ?? null,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
    };
  }

  /** Labels every line, grouped by order reference. */
  private async toLines(items: OrderItemRow[]): Promise<Map<string, OrderLine[]>> {
    const plans = await this.pricing.findPlans(items.map((item) => item.planId));
    const byOrder = new Map<string, OrderLine[]>();
    for (const item of items) {
      const plan = plans.get(item.planId);
      const line: OrderLine = {
        planId: item.planId,
        quantity: item.quantity,
        label: plan ? orderLineLabel(plan, item.quantity) : item.planId,
        amount: paiseToRupees(item.linePaise),
      };
      byOrder.set(item.orderReference, [...(byOrder.get(item.orderReference) ?? []), line]);
    }
    return byOrder;
  }
}
