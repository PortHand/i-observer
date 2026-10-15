import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lt, or, sum, type SQL } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import type { Tx } from "@/server/core/database";
import { orderItems, orders, type OrderStatus } from "../schema/orderSchema";

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type NewOrder = Omit<
  typeof orders.$inferInsert,
  "status" | "utr" | "receiptPath" | "createdAt" | "updatedAt" | "submittedAt" | "reviewedAt" | "reviewNote"
>;
export type OrderChanges = Omit<NewOrder, "reference">;
export type NewOrderItem = Omit<typeof orderItems.$inferInsert, "id" | "orderReference">;

/** Filters for the admin order list. */
export interface OrderFilter {
  /** Only orders in this status; all when omitted. */
  status?: OrderStatus;
  /** Part of a reference, email or UTR, matched case-insensitively. */
  search?: string;
}

/** `%`, `_` and `\` are wildcards in LIKE: escape them so a search matches them literally. */
const likeTerm = (text: string) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

const filterWhere = ({ status, search }: OrderFilter): SQL | undefined => {
  const term = search ? likeTerm(search) : null;
  return and(
    status ? eq(orders.status, status) : undefined,
    term ? or(ilike(orders.reference, term), ilike(orders.email, term), ilike(orders.utr, term)) : undefined,
  );
};

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

  /**
   * A page of orders, newest first. Submitted orders are the ones to review, so a status filter of
   * "submitted" lists them oldest first instead: the longest-waiting customer comes first.
   */
  list(filter: OrderFilter, limit: number, offset: number): Promise<OrderRow[]> {
    const order = filter.status === "submitted" ? asc(orders.submittedAt) : desc(orders.createdAt);
    return this.db.select().from(orders).where(filterWhere(filter)).orderBy(order, asc(orders.reference)).limit(limit).offset(offset);
  }

  /** Orders matching `search` (no status filter), counted per status. */
  async countByStatus(search?: string): Promise<Partial<Record<OrderStatus, number>>> {
    const rows = await this.db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .where(filterWhere({ search }))
      .groupBy(orders.status);
    return Object.fromEntries(rows.map((row) => [row.status, row.total]));
  }

  /** Verified orders reviewed in [from, to): how many, and their total in paise. */
  async verifiedBetween(from: Date, to?: Date): Promise<{ orders: number; paise: number }> {
    const [row] = await this.db
      .select({ orders: count(), paise: sum(orders.amountPaise).mapWith(Number) })
      .from(orders)
      .where(and(eq(orders.status, "verified"), gte(orders.reviewedAt, from), to ? lt(orders.reviewedAt, to) : undefined));
    return { orders: row?.orders ?? 0, paise: row?.paise ?? 0 };
  }

  async countCreatedSince(from: Date): Promise<number> {
    const [row] = await this.db.select({ total: count() }).from(orders).where(gte(orders.createdAt, from));
    return row?.total ?? 0;
  }

  /** The latest reviews (verified, rejected or refunded), newest first. */
  recentlyReviewed(limit: number): Promise<OrderRow[]> {
    return this.db.select().from(orders).where(isNotNull(orders.reviewedAt)).orderBy(desc(orders.reviewedAt)).limit(limit);
  }

  /** The lines of several orders at once, for a list page. */
  findItemsFor(references: string[]): Promise<OrderItemRow[]> {
    if (references.length === 0) return Promise.resolve([]);
    return this.db.select().from(orderItems).where(inArray(orderItems.orderReference, references)).orderBy(asc(orderItems.id));
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

  /** Records the UTR and receipt path. Returns null if the order doesn't exist or was already submitted. */
  async submit(reference: string, utr: string, receiptPath: string | null): Promise<OrderRow | null> {
    const now = new Date();
    const [row] = await this.db
      .update(orders)
      .set({ status: "submitted", utr, receiptPath, submittedAt: now, updatedAt: now })
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
