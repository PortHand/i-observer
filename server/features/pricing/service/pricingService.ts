import "server-only";
import type { Payee, Plan } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type { PlanRow, PricedPlan, PricingRepository } from "../repository/pricingRepository";

export const paiseToRupees = (paise: number) => paise / 100;

export const toPlan = ({ plan, price }: PricedPlan): Plan => ({
  id: plan.id,
  name: plan.name,
  amount: paiseToRupees(price.amountPaise),
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
