import "server-only";
import { pricePlans, type PlanId } from "@/app/(view)/(pview)/get-iobserver/content/getContent";
import { HttpError } from "@/server/core/httpError";
import { randomCode, withUniqueCode } from "@/server/core/randomCode";
import { UtrAlreadyUsedError, type OrderRepository, type OrderSummary } from "../repository/orderRepository";

export interface CreateOrderInput {
  planId: PlanId;
  email: string;
  phone: string;
}

export interface SubmitTransactionInput {
  utr: string;
  screenshot: File | null;
}

export class OrderService {
  private readonly orders: OrderRepository;

  constructor(orders: OrderRepository) {
    this.orders = orders;
  }

  /** Saves the plan and contact details. The price comes from the plan here, never from the client. */
  async createOrder({ planId, email, phone }: CreateOrderInput): Promise<OrderSummary> {
    const plan = pricePlans.find(({ id }) => id === planId);
    if (!plan) throw HttpError.badRequest("That plan is no longer available.");
    return withUniqueCode(
      () => `IOB-${randomCode(6)}`,
      (reference) => this.orders.create({ reference, planId, amount: plan.amount, email, phone }),
    );
  }

  async submitTransaction(reference: string, { utr, screenshot }: SubmitTransactionInput): Promise<OrderSummary> {
    const order = await this.orders.findByReference(reference);
    if (!order) throw HttpError.notFound(`There is no order ${reference}.`);
    if (order.status === "paid") throw HttpError.conflict("This order is already paid. Your login is on its way.");
    if (order.status === "cancelled") throw HttpError.conflict("This order was cancelled. Start a new one to buy again.");

    const file = screenshot && {
      name: screenshot.name,
      type: screenshot.type,
      data: Buffer.from(await screenshot.arrayBuffer()),
    };
    try {
      return await this.orders.recordPayment(reference, { utr, screenshot: file });
    } catch (error) {
      if (error instanceof UtrAlreadyUsedError) {
        throw HttpError.conflict("This UTR is already linked to another order. Check the number, or contact us.");
      }
      throw error;
    }
  }
}
