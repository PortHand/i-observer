import "server-only";
import type { Payee, Plan } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import type { PlanRow, PricingRepository } from "../repository/pricingRepository";

export const paiseToRupees = (paise: number) => paise / 100;

export const toPlan = (row: PlanRow): Plan => ({
  id: row.id,
  name: row.name,
  amount: paiseToRupees(row.amountPaise),
  period: row.period,
  description: row.description,
  badge: row.badge,
  isDefault: row.isDefault,
});

export class PricingService {
  private readonly pricing: PricingRepository;

  constructor(pricing: PricingRepository) {
    this.pricing = pricing;
  }

  async listPlans(): Promise<Plan[]> {
    return (await this.pricing.listActivePlans()).map(toPlan);
  }

  /** A plan customers can order, with its price in paise, or null if there's no such active plan. */
  findActivePlan(id: string): Promise<PlanRow | null> {
    return this.pricing.findActivePlan(id);
  }

  /** Any plan, active or not, for showing an existing order. */
  findPlan(id: string): Promise<PlanRow | null> {
    return this.pricing.findPlan(id);
  }

  /** The UPI account new orders pay. Throws, so the customer sees a server error, when none is active. */
  async getPayee(): Promise<Payee> {
    const account = await this.pricing.findActiveUpiAccount();
    if (!account) throw new Error("No active UPI account: add one to the upi_accounts table with active = true.");
    return { upiId: account.upiId, name: account.payeeName };
  }
}
