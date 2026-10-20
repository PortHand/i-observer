import { notFound } from "next/navigation";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { pricingService } from "@/server/features/pricing/module/pricingModule";
import { MAX_PLANS_ON_SALE } from "../content/adminContent";
import { emptyPlanInput, planToInput } from "../helper/planHelper";
import PlanEditorForm from "./PlanEditorForm";

/**
 * One plan's editor, or a new plan's when `id` is null. Reads the session and the database: render
 * inside <Suspense>.
 */
export default async function PlanEditor({ id }: { id: Promise<string> | null }) {
  await requireUser("admin");
  // Straight from the database, not the pages' cache, so the form starts from what's saved.
  const plans = await pricingService.adminPlans();
  if (id === null) {
    const next = emptyPlanInput(Math.max(0, ...plans.map((plan) => plan.sortOrder)) + 1);
    // A new plan starts off when the grid is already full.
    const full = plans.filter((plan) => plan.active).length >= MAX_PLANS_ON_SALE;
    return <PlanEditorForm plan={null} initial={{ ...next, active: !full }} />;
  }
  const planId = await id;
  const plan = plans.find((row) => row.id === planId);
  if (!plan) notFound();
  return <PlanEditorForm plan={plan} initial={planToInput(plan)} />;
}
