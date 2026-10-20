import type { Metadata } from "next";
import { Suspense } from "react";
import PlanEditor from "../../components/PlanEditor";
import PlanEditorSkeleton from "../../components/PlanEditorSkeleton";

export const metadata: Metadata = {
  title: "Admin · New plan",
  robots: { index: false },
};

/** Admin portal: add a plan. Admins only. */
export default function AdminNewPlanView() {
  return (
    <Suspense fallback={<PlanEditorSkeleton />}>
      <PlanEditor id={null} />
    </Suspense>
  );
}
