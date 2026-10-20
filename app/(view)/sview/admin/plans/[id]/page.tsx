import type { Metadata } from "next";
import { Suspense } from "react";
import PlanEditor from "../../components/PlanEditor";
import PlanEditorSkeleton from "../../components/PlanEditorSkeleton";

export const metadata: Metadata = {
  title: "Admin · Plan",
  robots: { index: false },
};

/** Admin portal: one plan's details, price and rules. Admins only. */
export default function AdminPlanView({ params }: PageProps<"/sview/admin/plans/[id]">) {
  return (
    <Suspense fallback={<PlanEditorSkeleton />}>
      <PlanEditor id={params.then(({ id }) => decodeURIComponent(id))} />
    </Suspense>
  );
}
