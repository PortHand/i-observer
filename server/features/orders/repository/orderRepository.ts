import "server-only";
import { eq } from "drizzle-orm";
import { BaseRepository, isUniqueViolation } from "@/server/core/baseRepository";
import { orders } from "../schema/orderSchema";

export type NewOrder = Pick<typeof orders.$inferInsert, "reference" | "planId" | "amount" | "email" | "phone">;

export interface PaymentDetails {
  utr: string;
  screenshot: { name: string; type: string; data: Buffer } | null;
}

/** Order columns without the screenshot bytes. */
const summary = {
  reference: orders.reference,
  planId: orders.planId,
  amount: orders.amount,
  email: orders.email,
  phone: orders.phone,
  status: orders.status,
  paymentSubmittedAt: orders.paymentSubmittedAt,
  createdAt: orders.createdAt,
};

export type OrderSummary = Pick<typeof orders.$inferSelect, keyof typeof summary>;

export class UtrAlreadyUsedError extends Error {}

export class OrderRepository extends BaseRepository {
  /** Returns null if the reference is already taken, so the caller can retry with another. */
  async create(order: NewOrder): Promise<OrderSummary | null> {
    const [row] = await this.db
      .insert(orders)
      .values(order)
      .onConflictDoNothing({ target: orders.reference })
      .returning(summary);
    return row ?? null;
  }

  async findByReference(reference: string): Promise<OrderSummary | null> {
    const [row] = await this.db.select(summary).from(orders).where(eq(orders.reference, reference)).limit(1);
    return row ?? null;
  }

  /** Saves the payment the customer reports and marks the order for checking. Replaces an earlier report. */
  async recordPayment(reference: string, { utr, screenshot }: PaymentDetails): Promise<OrderSummary> {
    try {
      const [row] = await this.db
        .update(orders)
        .set({
          status: "payment_submitted",
          utr,
          screenshot: screenshot?.data ?? null,
          screenshotName: screenshot?.name ?? null,
          screenshotType: screenshot?.type ?? null,
          paymentSubmittedAt: new Date(),
        })
        .where(eq(orders.reference, reference))
        .returning(summary);
      return row;
    } catch (error) {
      if (isUniqueViolation(error, "orders_utr_unique")) throw new UtrAlreadyUsedError();
      throw error;
    }
  }
}
