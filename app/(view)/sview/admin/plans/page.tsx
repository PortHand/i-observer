import type { Metadata } from "next";
import { Suspense } from "react";
import Plans from "../components/Plans";
import PlansSkeleton from "../components/PlansSkeleton";

export const metadata: Metadata = {
  title: "Admin · Plans & pricing",
  robots: { index: false },
};

/** Admin portal: add and edit the plans customers can buy, and their prices. Admins only. */
export default function AdminPlansView() {
  return (
    <Suspense fallback={<PlansSkeleton />}>
      <Plans />
    </Suspense>
  );
}
