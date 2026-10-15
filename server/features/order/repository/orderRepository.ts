import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import type { Tx } from "@/server/core/database";
import { orderItems, orders, type OrderStatus } from "../schema/orderSchema";

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrder = Omit<
  typeof orders.$inferInsert,
  "status" | "utr" | "createdAt" | "updatedAt" | "submittedAt" | "reviewedAt" | "reviewNote"
>;
export type OrderChanges = Omit<NewOrder, "reference">;
export type NewOrderItem = Omit<typeof orderItems.$inferInsert, "id" | "orderReference">;

export class OrderRepository extends BaseRepository {
  /** Saves the order and its lines together. Returns null if the reference is already taken, so the caller can retry with another. */
  create(order: NewOrder, items: NewOrderItem[]): Promise<OrderRow | null> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.insert(orders).values(order).onConflictDoNothing({ target: orders.reference }).returning();
      if (!row) return null;
      await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderReference: row.reference })));
      return row;
    });
  }

  async find(reference: string): Promise<OrderRow | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.reference, reference));
    return row ?? null;
  }

  findItems(reference: string, tx?: Tx): Promise<OrderItemRow[]> {
    return this.using(tx)
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderReference, reference))
      .orderBy(asc(orderItems.id));
  }

  /** Changes a pending order and replaces its lines. Returns null if it doesn't exist or the payment was already submitted. */
  updatePending(reference: string, changes: OrderChanges, items: NewOrderItem[]): Promise<OrderRow | null> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .update(orders)
        .set({ ...changes, updatedAt: new Date() })
        .where(and(eq(orders.reference, reference), eq(orders.status, "pending")))
        .returning();
      if (!row) return null;
      await tx.delete(orderItems).where(eq(orderItems.orderReference, reference));
      await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderReference: reference })));
      return row;
    });
  }

  /** Records the UTR. Returns null if the order doesn't exist or was already submitted. */
  async submit(reference: string, utr: string): Promise<OrderRow | null> {
    const now = new Date();
    const [row] = await this.db
      .update(orders)
      .set({ status: "submitted", utr, submittedAt: now, updatedAt: now })
      .where(and(eq(orders.reference, reference), eq(orders.status, "pending")))
      .returning();
    return row ?? null;
  }

  /**
   * Moves the order from `from` to `to`, recording when and why. Returns null if it isn't in `from`
   * (or doesn't exist). The row stays locked until `tx` ends, so two reviews can't both apply.
   */
  async review(tx: Tx, reference: string, from: OrderStatus, to: OrderStatus, note: string | null): Promise<OrderRow | null> {
    const now = new Date();
    const [row] = await tx
      .update(orders)
      .set({ status: to, reviewedAt: now, reviewNote: note, updatedAt: now })
      .where(and(eq(orders.reference, reference), eq(orders.status, from)))
      .returning();
    return row ?? null;
  }
}
