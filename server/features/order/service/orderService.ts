import "server-only";
import { planTitle } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { Order, OrderRequest } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { HttpError } from "@/server/core/httpError";
import { randomCode, withUniqueCode } from "@/server/core/randomCode";
import { paiseToRupees, type PricingService } from "@/server/features/pricing/service/pricingService";
import type { OtpKey } from "@/server/features/otp/repository/otpRepository";
import type { OtpService } from "@/server/features/otp/service/otpService";
import type { OrderChanges, OrderRepository, OrderRow } from "../repository/orderRepository";

/** The OTP that proves the customer owns the order's email. */
const checkoutEmail = (email: string): OtpKey => ({ channel: "email", target: email, purpose: "checkout" });

const messages = {
  plan: "This plan isn't available any more. Choose another.",
  notFound: "We couldn't find this order. Start again from step 1.",
  alreadySubmitted: "This order's payment was already submitted. Contact support to change it.",
};

export class OrderService {
  private readonly orders: OrderRepository;
  private readonly pricing: PricingService;
  private readonly otp: OtpService;

  constructor(orders: OrderRepository, pricing: PricingService, otp: OtpService) {
    this.orders = orders;
    this.pricing = pricing;
    this.otp = otp;
  }

  /**
   * Saves the order with the plan's current price and the active UPI account, before the QR code is
   * shown. `emailToken` proves the customer owns the email (see OtpService).
   */
  async create(request: OrderRequest, emailToken: string | null): Promise<Order> {
    await this.otp.assertVerified(checkoutEmail(request.email), emailToken);
    const details = await this.snapshot(request);
    const row = await withUniqueCode(
      () => `IOV-${randomCode(6)}`,
      (reference) => this.orders.create({ reference, ...details }),
    );
    return this.toOrder(row);
  }

  /** Changes the plan or contact details of an unpaid order, refreshing its price and payee. A new email needs a new token. */
  async update(reference: string, request: OrderRequest, emailToken: string | null): Promise<Order> {
    const current = await this.orders.find(reference);
    if (!current) throw HttpError.notFound(messages.notFound);
    if (current.email !== request.email) await this.otp.assertVerified(checkoutEmail(request.email), emailToken);
    const row = await this.orders.updatePending(reference, await this.snapshot(request));
    if (!row) throw await this.unchangeable(reference);
    return this.toOrder(row);
  }

  /** Records the customer's UTR, so the payment can be checked against the bank statement. */
  async submit(reference: string, utr: string): Promise<{ submittedAt: string }> {
    const row = await this.orders.submit(reference, utr);
    if (!row?.submittedAt) throw await this.unchangeable(reference);
    return { submittedAt: row.submittedAt.toISOString() };
  }

  private async snapshot({ planId, email, phone }: OrderRequest): Promise<OrderChanges> {
    const plan = await this.pricing.findActivePlan(planId);
    if (!plan) throw HttpError.badRequest(messages.plan, { planId: messages.plan });
    const payee = await this.pricing.getPayee();
    return { planId, email, phone, amountPaise: plan.amountPaise, upiId: payee.upiId, payeeName: payee.name };
  }

  private async unchangeable(reference: string) {
    return (await this.orders.find(reference))
      ? HttpError.conflict(messages.alreadySubmitted)
      : HttpError.notFound(messages.notFound);
  }

  private async toOrder(row: OrderRow): Promise<Order> {
    const plan = await this.pricing.findPlan(row.planId);
    return {
      reference: row.reference,
      planId: row.planId,
      planLabel: plan ? planTitle(plan) : row.planId,
      email: row.email,
      phone: row.phone,
      amount: paiseToRupees(row.amountPaise),
      payee: { upiId: row.upiId, name: row.payeeName },
    };
  }
}
