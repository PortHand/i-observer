import "server-only";
import { orderLineLabel } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import type { OrderLine } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { paiseToRupees, type PricingService } from "@/server/features/pricing/service/pricingService";
import type { OrderItemRow } from "../repository/orderRepository";

/** Labels every line ("iOverlay Yearly · 12 months"), grouped by order reference. */
export const labelOrderLines = async (pricing: PricingService, items: OrderItemRow[]): Promise<Map<string, OrderLine[]>> => {
  const plans = await pricing.findPlans(items.map((item) => item.planId));
  const byOrder = new Map<string, OrderLine[]>();
  for (const item of items) {
    const plan = plans.get(item.planId);
    const line: OrderLine = {
      planId: item.planId,
      quantity: item.quantity,
      label: plan ? orderLineLabel(plan, item.quantity) : item.planId,
      amount: paiseToRupees(item.linePaise),
    };
    byOrder.set(item.orderReference, [...(byOrder.get(item.orderReference) ?? []), line]);
  }
  return byOrder;
};
