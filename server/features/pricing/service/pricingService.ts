import "server-only";
import type { Payee, Plan } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { MAX_PLANS_ON_SALE, plansPage } from "@/app/(view)/sview/admin/content/adminContent";
import type { PlanChange } from "@/app/(view)/sview/admin/helper/planHelper";
import type { AdminPlanStatus, AdminPlanView } from "@/app/(view)/sview/admin/services/adminService";
import { Database } from "@/server/core/database";
import { HttpError } from "@/server/core/httpError";
import type { PlanPriceRow, PlanRow, PricedPlan, PricingRepository } from "../repository/pricingRepository";

export const paiseToRupees = (paise: number) => paise / 100;

const compareAtRupees = (price: PlanPriceRow | undefined) =>
  price?.compareAtPaise ? paiseToRupees(price.compareAtPaise) : null;

export const toPlan = ({ plan, price }: PricedPlan): Plan => ({
  id: plan.id,
  name: plan.name,
  amount: paiseToRupees(price.amountPaise),
  compareAtAmount: compareAtRupees(price),
  period: plan.period,
  description: plan.description,
  badge: plan.badge,
  isDefault: plan.isDefault,
  maxQuantity: plan.maxQuantity,
});

export class PricingService {
  private readonly pricing: PricingRepository;

  constructor(pricing: PricingRepository) {
    this.pricing = pricing;
  }

  async listPlans(): Promise<Plan[]> {
    return (await this.pricing.listPlansOnSale()).map(toPlan);
  }

  /** Every plan with its normal price and whether customers can see it now, for the admin portal. */
  async adminPlans(): Promise<AdminPlanView[]> {
    const rows = await this.pricing.listPlans();
    const ids = rows.map((row) => row.id);
    const [current, base] = await Promise.all([this.pricing.currentPrices(ids), this.pricing.basePrices(ids)]);
    const now = Date.now();
    return rows.map((plan) => {
      const price = base.get(plan.id);
      const selling = current.get(plan.id);
      const inWindow =
        (!plan.availableFrom || plan.availableFrom.getTime() <= now) && (!plan.availableUntil || plan.availableUntil.getTime() > now);
      const status: AdminPlanStatus = !plan.active ? "off" : !selling ? "noPrice" : inWindow ? "onSale" : "scheduled";
      // A row with an end date (a sale, added in the database) beats the normal price while it runs.
      const sale =
        selling?.validTo && selling.id !== price?.id
          ? { price: paiseToRupees(selling.amountPaise), compareAtPrice: compareAtRupees(selling), until: selling.validTo.toISOString() }
          : null;
      return {
        id: plan.id,
        name: plan.name,
        period: plan.period,
        description: plan.description,
        badge: plan.badge,
        durationMonths: plan.durationMonths,
        durationHours: plan.durationHours,
        sortOrder: plan.sortOrder,
        maxQuantity: plan.maxQuantity,
        isDefault: plan.isDefault,
        active: plan.active,
        availableFrom: plan.availableFrom?.toISOString() ?? null,
        availableUntil: plan.availableUntil?.toISOString() ?? null,
        price: price ? paiseToRupees(price.amountPaise) : null,
        compareAtPrice: compareAtRupees(price),
        sale,
        status,
      };
    });
  }

  /**
   * Adds a plan (`isNew`) or changes one, and its normal price when that changed: all together or
   * not at all. `change` must have passed parsePlanForm.
   */
  savePlan(change: PlanChange, isNew: boolean): Promise<void> {
    const { errors } = plansPage;
    const { amountPaise, compareAtPaise, ...values } = change;
    return Database.transaction(async (tx) => {
      if (change.active && (await this.pricing.countActive(tx, change.id)) >= MAX_PLANS_ON_SALE)
        throw HttpError.badRequest(errors.tooMany, { active: errors.tooMany });
      if (change.isDefault) await this.pricing.clearDefault(tx, change.id);
      if (isNew) {
        if ((await this.pricing.findPlans([change.id])).length > 0) throw HttpError.badRequest(errors.idTaken, { id: errors.idTaken });
        await this.pricing.insertPlan(tx, values);
      } else if (!(await this.pricing.updatePlan(tx, values))) {
        throw HttpError.notFound(errors.notFound);
      }
      const base = (await this.pricing.basePrices([change.id], tx)).get(change.id);
      if (!base || base.amountPaise !== amountPaise || base.compareAtPaise !== compareAtPaise)
        await this.pricing.replaceBasePrice(tx, change.id, amountPaise, compareAtPaise);
    });
  }

  /**
   * Turns a plan on or off straight from the plans table. Same rules as the form: at most
   * MAX_PLANS_ON_SALE on, and the default plan stays on.
   */
  setPlanActive(id: string, active: boolean): Promise<void> {
    const { errors } = plansPage;
    return Database.transaction(async (tx) => {
      if (active && (await this.pricing.countActive(tx, id)) >= MAX_PLANS_ON_SALE) throw HttpError.badRequest(errors.tooMany);
      const before = await this.pricing.setActive(tx, id, active);
      if (!before) throw HttpError.notFound(errors.notFound);
      if (!active && before.isDefault) throw HttpError.badRequest(errors.defaultOff);
    });
  }

  /** A plan customers can order now, with its current price row, or null if it can't be ordered. */
  findPlanOnSale(id: string): Promise<PricedPlan | null> {
    return this.pricing.findPlanOnSale(id);
  }

  /** Plans by id, active or not, for showing existing orders. */
  async findPlans(ids: string[]): Promise<Map<string, PlanRow>> {
    return new Map((await this.pricing.findPlans([...new Set(ids)])).map((plan) => [plan.id, plan]));
  }

  /** The UPI account new orders pay. Throws, so the customer sees a server error, when none is active. */
  async getPayee(): Promise<Payee> {
    const account = await this.pricing.findActiveUpiAccount();
    if (!account) throw new Error("No active UPI account: add one to the upi_accounts table with active = true.");
    return { upiId: account.upiId, name: account.payeeName };
  }
}
