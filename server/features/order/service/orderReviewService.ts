import "server-only";
import { formatAmount, orderLabel, orderLineLabel } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { OrderLine } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type {
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

  /** One page of orders with this status (or all), matching `search`, plus the count per status. */
  async list(status: StatusFilter, search: string, page: number): Promise<AdminOrderPage> {
    const filter = { status: status === "all" ? undefined : status, search: search || undefined };
    const byStatus = await this.orders.countByStatus(filter.search);
    const counts = Object.fromEntries(ORDER_STATUSES.map((value) => [value, byStatus[value] ?? 0])) as AdminOrderPage["counts"];
    counts.all = ORDER_STATUSES.reduce((total, value) => total + counts[value], 0);

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
