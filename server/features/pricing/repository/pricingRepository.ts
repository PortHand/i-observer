import "server-only";
import { and, asc, count, desc, eq, gt, inArray, isNull, lte, ne, or, sql } from "drizzle-orm";
import { MAX_PLANS_ON_SALE } from "@/app/(view)/sview/admin/content/adminContent";
import { BaseRepository } from "@/server/core/baseRepository";
import type { Tx } from "@/server/core/database";
import { planPrices, plans, upiAccounts } from "../schema/pricingSchema";

export type PlanRow = typeof plans.$inferSelect;
export type PlanPriceRow = typeof planPrices.$inferSelect;
export type UpiAccountRow = typeof upiAccounts.$inferSelect;
/** A plan's own columns, as the admin portal saves them. */
export type PlanValues = Omit<typeof plans.$inferInsert, "updatedAt">;

/** A plan customers can buy now, with the price it sells at now. */
export interface PricedPlan {
  plan: PlanRow;
  price: PlanPriceRow;
}

/** Active, and inside its sale window. */
const onSale = and(
  eq(plans.active, true),
  or(isNull(plans.availableFrom), lte(plans.availableFrom, sql`now()`)),
  or(isNull(plans.availableUntil), gt(plans.availableUntil, sql`now()`)),
);

/** Price rows that have started and not ended. */
const priceInForce = and(
  lte(planPrices.validFrom, sql`now()`),
  or(isNull(planPrices.validTo), gt(planPrices.validTo, sql`now()`)),
);

export class PricingRepository extends BaseRepository {
  /**
   * Plans customers can buy now, in display order. A plan without a price in force is left out, and
   * only the first MAX_PLANS_ON_SALE are kept: the pricing grids have room for no more.
   */
  async listPlansOnSale(): Promise<PricedPlan[]> {
    const rows = await this.db.select().from(plans).where(onSale).orderBy(asc(plans.sortOrder), asc(plans.id));
    const prices = await this.currentPrices(rows.map((row) => row.id));
    const priced = rows.flatMap((plan) => {
      const price = prices.get(plan.id);
      return price ? [{ plan, price }] : [];
    });
    return priced.slice(0, MAX_PLANS_ON_SALE);
  }

  /** Every plan, on sale or not, in display order: for the admin portal. */
  listPlans(): Promise<PlanRow[]> {
    return this.db.select().from(plans).orderBy(asc(plans.sortOrder), asc(plans.id));
  }

  /** The plan with its price now, or null if it can't be bought now. */
  async findPlanOnSale(id: string): Promise<PricedPlan | null> {
    const [plan] = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, id), onSale));
    const price = plan && (await this.currentPrices([id])).get(id);
    return price ? { plan, price } : null;
  }

  /** Any plan, active or not: old orders still need the name of a plan that was since hidden. */
  async findPlans(ids: string[]): Promise<PlanRow[]> {
    if (ids.length === 0) return [];
    return this.db.select().from(plans).where(inArray(plans.id, ids));
  }

  async findActiveUpiAccount(): Promise<UpiAccountRow | null> {
    const [row] = await this.db.select().from(upiAccounts).where(eq(upiAccounts.active, true));
    return row ?? null;
  }

  /**
   * Plan id → its normal price now: the open-ended row in force, ignoring any sale running over it.
   * The admin portal edits this one.
   */
  async basePrices(planIds: string[], tx?: Tx): Promise<Map<string, PlanPriceRow>> {
    if (planIds.length === 0) return new Map();
    const rows = await this.using(tx)
      .selectDistinctOn([planPrices.planId])
      .from(planPrices)
      .where(and(inArray(planPrices.planId, planIds), priceInForce, isNull(planPrices.validTo)))
      .orderBy(asc(planPrices.planId), desc(planPrices.validFrom), desc(planPrices.id));
    return new Map(rows.map((row) => [row.planId, row]));
  }

  /** Active plans other than `exceptId`, to keep at most MAX_PLANS_ON_SALE on sale. */
  async countActive(tx: Tx, exceptId: string): Promise<number> {
    const [row] = await tx
      .select({ count: count() })
      .from(plans)
      .where(and(eq(plans.active, true), ne(plans.id, exceptId)));
    return row.count;
  }

  /** Makes room for a new default: at most one plan can be the default (plans_one_default_idx). */
  async clearDefault(tx: Tx, exceptId: string): Promise<void> {
    await tx
      .update(plans)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(plans.isDefault, true), ne(plans.id, exceptId)));
  }

  async insertPlan(tx: Tx, values: PlanValues): Promise<void> {
    await tx.insert(plans).values(values);
  }

  /** Turns a plan on or off for sale. Returns the plan before the change, or null when there's none. */
  async setActive(tx: Tx, id: string, active: boolean): Promise<PlanRow | null> {
    const [before] = await tx.select().from(plans).where(eq(plans.id, id)).for("update");
    if (!before) return null;
    await tx.update(plans).set({ active, updatedAt: new Date() }).where(eq(plans.id, id));
    return before;
  }

  /** Returns false when there's no plan with this id. */
  async updatePlan(tx: Tx, { id, ...values }: PlanValues): Promise<boolean> {
    const rows = await tx
      .update(plans)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning({ id: plans.id });
    return rows.length > 0;
  }

  /**
   * A new normal price from now: ends the open-ended rows in force and adds one. Old rows are kept,
   * so orders still point at the price they were charged. A sale running over it keeps winning.
   */
  async replaceBasePrice(tx: Tx, planId: string, amountPaise: number, compareAtPaise: number | null): Promise<void> {
    await tx
      .update(planPrices)
      .set({ validTo: sql`now()` })
      .where(and(eq(planPrices.planId, planId), priceInForce, isNull(planPrices.validTo)));
    await tx.insert(planPrices).values({ planId, amountPaise, compareAtPaise });
  }

  /**
   * Plan id → its price now. Among the rows in force, one with an end date (a sale) beats an
   * open-ended one (the normal price), whenever either started; then the one that started last wins.
   */
  async currentPrices(planIds: string[]): Promise<Map<string, PlanPriceRow>> {
    if (planIds.length === 0) return new Map();
    const rows = await this.db
      .selectDistinctOn([planPrices.planId])
      .from(planPrices)
      .where(and(inArray(planPrices.planId, planIds), priceInForce))
      .orderBy(asc(planPrices.planId), sql`${planPrices.validTo} IS NULL`, desc(planPrices.validFrom), desc(planPrices.id));
    return new Map(rows.map((row) => [row.planId, row]));
  }
}
