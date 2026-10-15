import "server-only";
import { and, asc, desc, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { planPrices, plans, upiAccounts } from "../schema/pricingSchema";

export type PlanRow = typeof plans.$inferSelect;
export type PlanPriceRow = typeof planPrices.$inferSelect;
export type UpiAccountRow = typeof upiAccounts.$inferSelect;

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
  /** Plans customers can buy now, in display order. A plan without a price in force is left out. */
  async listPlansOnSale(): Promise<PricedPlan[]> {
    const rows = await this.db.select().from(plans).where(onSale).orderBy(asc(plans.sortOrder), asc(plans.id));
    const prices = await this.currentPrices(rows.map((row) => row.id));
    return rows.flatMap((plan) => {
      const price = prices.get(plan.id);
      return price ? [{ plan, price }] : [];
    });
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
   * Plan id → its price now. Among the rows in force, one with an end date (a sale) beats an
   * open-ended one (the normal price), whenever either started; then the one that started last wins.
   */
  private async currentPrices(planIds: string[]): Promise<Map<string, PlanPriceRow>> {
    if (planIds.length === 0) return new Map();
    const rows = await this.db
      .selectDistinctOn([planPrices.planId])
      .from(planPrices)
      .where(and(inArray(planPrices.planId, planIds), priceInForce))
      .orderBy(asc(planPrices.planId), sql`${planPrices.validTo} IS NULL`, desc(planPrices.validFrom), desc(planPrices.id));
    return new Map(rows.map((row) => [row.planId, row]));
  }
}
