import "server-only";
import { and, eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { orders } from "../schema/orderSchema";

export type OrderRow = typeof orders.$inferSelect;
export type NewOrder = Omit<typeof orders.$inferInsert, "status" | "utr" | "createdAt" | "updatedAt" | "submittedAt">;
export type OrderChanges = Omit<NewOrder, "reference">;

export class OrderRepository extends BaseRepository {
  /** Returns the order, or null if the reference is already taken so the caller can retry with another. */
  async create(order: NewOrder): Promise<OrderRow | null> {
    const [row] = await this.db
      .insert(orders)
      .values(order)
      .onConflictDoNothing({ target: orders.reference })
      .returning();
    return row ?? null;
  }

  async find(reference: string): Promise<OrderRow | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.reference, reference));
    return row ?? null;
  }

  /** Changes a pending order. Returns null if it doesn't exist or the payment was already submitted. */
  async updatePending(reference: string, changes: OrderChanges): Promise<OrderRow | null> {
    const [row] = await this.db
      .update(orders)
      .set({ ...changes, updatedAt: new Date() })
      .where(and(eq(orders.reference, reference), eq(orders.status, "pending")))
      .returning();
    return row ?? null;
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
}
