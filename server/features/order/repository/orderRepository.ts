import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lt, ne, or, sql, sum, type SQL, type SQLWrapper } from "drizzle-orm";
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

/** Orders that used up a free plan: claimed (verified), or claimed and later taken back. */
const CLAIMED_STATUSES: OrderStatus[] = ["submitted", "verified", "refunded"];

/** `%`, `_` and `\` are wildcards in LIKE: escape them so a search matches them literally. */
const likeTerm = (text: string) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

/** The IST calendar day of a timestamp column, as "YYYY-MM-DD". */
const istDay = (column: SQLWrapper) => sql<string>`to_char(${column} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`;

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

  /** Every order of one account, newest first. */
  listForUser(userId: string): Promise<OrderRow[]> {
    return this.db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
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

  /** Orders created in [from, to): how many, and how many of those the customer paid (sent a UTR). */
  async createdBetween(from: Date, to?: Date): Promise<{ orders: number; paid: number }> {
    const [row] = await this.db
      .select({ orders: count(), paid: count(orders.submittedAt) })
      .from(orders)
      .where(and(gte(orders.createdAt, from), to ? lt(orders.createdAt, to) : undefined));
    return { orders: row?.orders ?? 0, paid: row?.paid ?? 0 };
  }

  /** Orders created per IST day since `from`. Days with none are left out. */
  async createdPerDay(from: Date): Promise<{ day: string; orders: number }[]> {
    const day = istDay(orders.createdAt);
    return this.db.select({ day, orders: count() }).from(orders).where(gte(orders.createdAt, from)).groupBy(day);
  }

  /** Verified orders per IST day of review since `from`: how many, and their total in paise. Days with none are left out. */
  async verifiedPerDay(from: Date): Promise<{ day: string; orders: number; paise: number }[]> {
    const day = istDay(orders.reviewedAt);
    const rows = await this.db
      .select({ day, orders: count(), paise: sum(orders.amountPaise).mapWith(Number) })
      .from(orders)
      .where(and(eq(orders.status, "verified"), gte(orders.reviewedAt, from)))
      .groupBy(day);
    return rows.map((row) => ({ ...row, paise: row.paise ?? 0 }));
  }

  /**
   * Payments decided (approved or rejected) since `from`, and the mean time from UTR to decision in
   * seconds (null when none). Refunds are left out: their review time is when the money went back.
   */
  async decisionsSince(from: Date): Promise<{ verified: number; rejected: number; avgSeconds: number | null }> {
    const [row] = await this.db
      .select({
        verified: count(sql`case when ${orders.status} = 'verified' then 1 end`),
        rejected: count(sql`case when ${orders.status} = 'rejected' then 1 end`),
        avgSeconds: sql<number | null>`avg(extract(epoch from ${orders.reviewedAt} - ${orders.submittedAt}))`.mapWith(Number),
      })
      .from(orders)
      .where(and(inArray(orders.status, ["verified", "rejected"]), gte(orders.reviewedAt, from)));
    return { verified: row?.verified ?? 0, rejected: row?.rejected ?? 0, avgSeconds: row?.avgSeconds ?? null };
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
   * Whether this email or this phone already claimed `planId` for free (a ₹0 line), on an order
   * other than `exceptReference`. Lines bought while the plan still cost money don't count.
   */
  async hasClaimedFree(planId: string, email: string, phone: string, exceptReference?: string, tx?: Tx): Promise<boolean> {
    const [row] = await this.using(tx)
      .select({ reference: orders.reference })
      .from(orderItems)
      .innerJoin(orders, eq(orders.reference, orderItems.orderReference))
      .where(
        and(
          eq(orderItems.planId, planId),
          eq(orderItems.unitPaise, 0),
          inArray(orders.status, CLAIMED_STATUSES),
          or(eq(orders.email, email), eq(orders.phone, phone)),
          exceptReference ? ne(orders.reference, exceptReference) : undefined,
        ),
      )
      .limit(1);
    return row !== undefined;
  }

  /**
   * Holds off other claims of `planId` by this email or phone until `tx` ends, so two at once can't
   * both pass hasClaimedFree. Email first, then phone, in every caller, so claims can't deadlock.
   */
  async lockFreeClaim(tx: Tx, planId: string, email: string, phone: string): Promise<void> {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`free:${planId}:email:${email}`}))`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`free:${planId}:phone:${phone}`}))`);
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
