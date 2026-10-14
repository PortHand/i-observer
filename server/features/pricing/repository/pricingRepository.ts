import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { plans, upiAccounts } from "../schema/pricingSchema";

export type PlanRow = typeof plans.$inferSelect;
export type UpiAccountRow = typeof upiAccounts.$inferSelect;

export class PricingRepository extends BaseRepository {
  /** Plans customers can buy, in display order. */
  listActivePlans(): Promise<PlanRow[]> {
    return this.db.select().from(plans).where(eq(plans.active, true)).orderBy(asc(plans.sortOrder), asc(plans.id));
  }

  /** Any plan, active or not: old orders still need the name of a plan that was since hidden. */
  async findPlan(id: string): Promise<PlanRow | null> {
    const [row] = await this.db.select().from(plans).where(eq(plans.id, id));
    return row ?? null;
  }

  async findActivePlan(id: string): Promise<PlanRow | null> {
    const [row] = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, id), eq(plans.active, true)));
    return row ?? null;
  }

  async findActiveUpiAccount(): Promise<UpiAccountRow | null> {
    const [row] = await this.db.select().from(upiAccounts).where(eq(upiAccounts.active, true));
    return row ?? null;
  }
}
