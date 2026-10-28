import "server-only";
import type { Payee, Plan } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { MAX_PLANS_ON_SALE, plansPage, upiPage } from "@/app/(view)/sview/admin/content/adminContent";
import type { PlanChange } from "@/app/(view)/sview/admin/helper/planHelper";
import type { UpiAccountInput } from "@/app/(view)/sview/admin/helper/upiHelper";
import type { AdminPlanStatus, AdminPlanView, UpiAccountView } from "@/app/(view)/sview/admin/services/adminService";
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

  /** The UPI account new orders pay. When none is active, the customer is told payments are paused. */
  async getPayee(): Promise<Payee> {
    const account = await this.pricing.findActiveUpiAccount();
    if (!account) {
      console.error("[pricing] No active UPI account, so an order was turned away: make one active on the admin portal's UPI accounts page.");
      throw HttpError.conflict(upiPage.errors.paymentsPaused);
    }
    return { upiId: account.upiId, name: account.payeeName };
  }

  /** Every UPI account, the active one first, for the admin portal. */
  async upiAccounts(): Promise<UpiAccountView[]> {
    return (await this.pricing.listUpiAccounts()).map((row) => ({
      id: row.id,
      upiId: row.upiId,
      payeeName: row.payeeName,
      active: row.active,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  /**
   * Adds an account (`id` null) or changes one, and makes it the active one when `input.active`.
   * `input` must have passed parseUpiAccountForm. Orders keep their own copy of the UPI ID, so
   * changing an account never changes what an existing order pays.
   */
  saveUpiAccount(id: number | null, input: UpiAccountInput): Promise<void> {
    const { errors } = upiPage;
    return Database.transaction(async (tx) => {
      if (await this.pricing.findUpiAccountByUpiId(tx, input.upiId, id)) throw HttpError.badRequest(errors.upiIdTaken, { upiId: errors.upiIdTaken });
      let accountId = id;
      if (accountId === null) {
        accountId = await this.pricing.insertUpiAccount(tx, input.upiId, input.payeeName);
      } else {
        if (!(await this.pricing.lockUpiAccount(tx, accountId))) throw HttpError.notFound(errors.notFound);
        await this.pricing.updateUpiAccount(tx, accountId, input.upiId, input.payeeName);
      }
      if (input.active) await this.pricing.activateUpiAccount(tx, accountId);
    });
  }

  /**
   * Turns an account on (the one new orders pay, switching off whichever was active, so the QR code
   * only ever shows one) or off (checkout then takes no payments until another is turned on).
   */
  setUpiAccountActive(id: number, active: boolean): Promise<void> {
    return Database.transaction(async (tx) => {
      if (!(await this.pricing.lockUpiAccount(tx, id))) throw HttpError.notFound(upiPage.errors.notFound);
      if (active) await this.pricing.activateUpiAccount(tx, id);
      else await this.pricing.deactivateUpiAccount(tx, id);
    });
  }

  /** Deletes an account that isn't taking payments: checkout always needs the active one. */
  deleteUpiAccount(id: number): Promise<void> {
    const { errors } = upiPage;
    return Database.transaction(async (tx) => {
      const account = await this.pricing.lockUpiAccount(tx, id);
      if (!account) throw HttpError.notFound(errors.notFound);
      if (account.active) throw HttpError.badRequest(errors.deleteActive);
      await this.pricing.deleteUpiAccount(tx, id);
    });
  }
}
