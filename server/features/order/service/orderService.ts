import "server-only";
import { ORDER_NOT_FOUND, orderLabel, orderLineLabel } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { Order, OrderLine, OrderRequest } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { Database } from "@/server/core/database";
import { HttpError } from "@/server/core/httpError";
import { randomCode, withUniqueCode } from "@/server/core/randomCode";
import type { EntitlementService } from "@/server/features/entitlement/service/entitlementService";
import { paiseToRupees, type PricingService } from "@/server/features/pricing/service/pricingService";
import type { OtpKey } from "@/server/features/otp/repository/otpRepository";
import type { OtpService } from "@/server/features/otp/service/otpService";
import type { UserService } from "@/server/features/user/service/userService";
import type { OrderStatus } from "../schema/orderSchema";
import type { NewOrderItem, OrderChanges, OrderItemRow, OrderRepository, OrderRow } from "../repository/orderRepository";

/** The OTP that proves the customer owns the order's email. */
const checkoutEmail = (email: string): OtpKey => ({ channel: "email", target: email, purpose: "checkout" });

const orderNotFound = () => new HttpError(404, messages.notFound, undefined, { code: ORDER_NOT_FOUND });

const messages = {
  plan: "This plan isn't available any more. Choose another.",
  tooMany: (plan: string, max: number) => `${plan} can be bought at most ${max} at a time.`,
  notFound: "We couldn't find this order. Start again from step 1.",
  alreadySubmitted: "This order's payment was already submitted. Contact support to change it.",
};

/** What an order's saved state looks like before it's written: the order row and its lines. */
interface OrderSnapshot {
  order: OrderChanges;
  items: NewOrderItem[];
}

/** Outcome of a payment review (verify, reject, refund). */
export interface ReviewResult {
  reference: string;
  status: OrderStatus;
}

export class OrderService {
  private readonly orders: OrderRepository;
  private readonly pricing: PricingService;
  private readonly otp: OtpService;
  private readonly users: UserService;
  private readonly entitlements: EntitlementService;

  constructor(
    orders: OrderRepository,
    pricing: PricingService,
    otp: OtpService,
    users: UserService,
    entitlements: EntitlementService,
  ) {
    this.orders = orders;
    this.pricing = pricing;
    this.otp = otp;
    this.users = users;
    this.entitlements = entitlements;
  }

  /**
   * Saves the order with each plan's current price and the active UPI account, before the QR code
   * is shown. A returning customer (same email and phone) goes straight through; anyone else needs
   * `emailToken` from an OTP (see OtpService). The account is then created, or found.
   */
  async create(request: OrderRequest, emailToken: string | null): Promise<Order> {
    await this.assertCustomer(request, emailToken);
    const { order, items } = await this.snapshot(request);
    const row = await withUniqueCode(
      () => `IOV-${randomCode(6)}`,
      (reference) => this.orders.create({ reference, ...order }, items),
    );
    return this.toOrder(row);
  }

  /** Changes the plans or contact details of an unpaid order, refreshing its prices and payee. Same checks as create(). */
  async update(reference: string, request: OrderRequest, emailToken: string | null): Promise<Order> {
    const current = await this.orders.find(reference);
    if (!current) throw orderNotFound();
    await this.assertCustomer(request, emailToken);
    const { order, items } = await this.snapshot(request);
    const row = await this.orders.updatePending(reference, order, items);
    if (!row) throw await this.unchangeable(reference);
    return this.toOrder(row);
  }

  /** Records the customer's UTR, so the payment can be checked against the bank statement. */
  async submit(reference: string, utr: string): Promise<{ submittedAt: string }> {
    const row = await this.orders.submit(reference, utr);
    if (!row?.submittedAt) throw await this.unchangeable(reference);
    return { submittedAt: row.submittedAt.toISOString() };
  }

  /**
   * The payment was found on the bank statement: marks the order verified and gives the customer
   * the time it bought, queued after any time they still have. Both happen together or not at all.
   */
  verify(reference: string, note: string | null = null): Promise<ReviewResult> {
    return Database.transaction(async (tx) => {
      const row = await this.orders.review(tx, reference, "submitted", "verified", note);
      if (!row) throw await this.wrongStatus(reference, "submitted");
      if (!row.userId) throw new Error(`Order ${reference} has no account (orders.user_id): set it before verifying.`);
      await this.entitlements.grant(tx, row.userId, await this.orders.findItems(reference, tx));
      return { reference, status: row.status };
    });
  }

  /** No matching payment: the customer gets nothing, and the order can't be submitted again. */
  reject(reference: string, note: string | null = null): Promise<ReviewResult> {
    return Database.transaction(async (tx) => {
      const row = await this.orders.review(tx, reference, "submitted", "rejected", note);
      if (!row) throw await this.wrongStatus(reference, "submitted");
      return { reference, status: row.status };
    });
  }

  /** The money went back: takes away the time this order gave. Later purchases move earlier to close the gap. */
  refund(reference: string, note: string | null = null): Promise<ReviewResult> {
    return Database.transaction(async (tx) => {
      const row = await this.orders.review(tx, reference, "verified", "refunded", note);
      if (!row) throw await this.wrongStatus(reference, "verified");
      const items = await this.orders.findItems(reference, tx);
      // Verified orders always have an account: verify() refuses ones without.
      await this.entitlements.revoke(tx, row.userId!, items.map((item) => item.id));
      return { reference, status: row.status };
    });
  }

  /**
   * Email and phone must both match one account, or both be new (409 otherwise, before any OTP).
   * A returning customer goes through; a new one needs an OTP token (throws "verification_required").
   */
  private async assertCustomer({ email, phone }: OrderRequest, emailToken: string | null) {
    if ((await this.users.match(email, phone)) === "returning") return;
    await this.otp.assertVerified(checkoutEmail(email), emailToken);
  }

  /** Prices every line now, checks it can be bought, and copies in the active UPI account. */
  private async snapshot({ items, email, phone }: OrderRequest): Promise<OrderSnapshot> {
    const lines: NewOrderItem[] = [];
    for (const { planId, quantity } of items) {
      const priced = await this.pricing.findPlanOnSale(planId);
      if (!priced) throw HttpError.badRequest(messages.plan, { items: messages.plan });
      const { plan, price } = priced;
      if (quantity > plan.maxQuantity) {
        const message = messages.tooMany(plan.name, plan.maxQuantity);
        throw HttpError.badRequest(message, { items: message });
      }
      lines.push({
        planId,
        planPriceId: price.id,
        quantity,
        unitPaise: price.amountPaise,
        linePaise: price.amountPaise * quantity,
        durationMonths: plan.durationMonths,
      });
    }
    const payee = await this.pricing.getPayee();
    // Only reached for a verified email or a returning customer: see assertCustomer.
    const user = await this.users.ensure({ email, phone });
    const amountPaise = lines.reduce((total, line) => total + line.linePaise, 0);
    return {
      order: { email, phone, userId: user.id, amountPaise, upiId: payee.upiId, payeeName: payee.name },
      items: lines,
    };
  }

  private async unchangeable(reference: string) {
    return (await this.orders.find(reference))
      ? HttpError.conflict(messages.alreadySubmitted)
      : orderNotFound();
  }

  /** For a review on an order that isn't in the status it needs. */
  private async wrongStatus(reference: string, needed: OrderStatus) {
    const order = await this.orders.find(reference);
    if (!order) return orderNotFound();
    return HttpError.conflict(`Order ${reference} is ${order.status}; this needs it to be ${needed}.`);
  }

  private async toOrder(row: OrderRow): Promise<Order> {
    const items = await this.toLines(await this.orders.findItems(row.reference));
    return {
      reference: row.reference,
      items,
      planLabel: orderLabel(items),
      email: row.email,
      phone: row.phone,
      amount: paiseToRupees(row.amountPaise),
      payee: { upiId: row.upiId, name: row.payeeName },
    };
  }

  private async toLines(items: OrderItemRow[]): Promise<OrderLine[]> {
    const plans = await this.pricing.findPlans(items.map((item) => item.planId));
    return items.map((item) => {
      const plan = plans.get(item.planId);
      return {
        planId: item.planId,
        quantity: item.quantity,
        label: plan ? orderLineLabel(plan, item.quantity) : item.planId,
        amount: paiseToRupees(item.linePaise),
      };
    });
  }
}
