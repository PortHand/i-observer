import type { Metadata } from "next";
import { Suspense } from "react";
import PlansSkeleton from "../components/PlansSkeleton";
import UpiAccounts from "../components/UpiAccounts";

export const metadata: Metadata = {
  title: "Admin · UPI accounts",
  robots: { index: false },
};

/** Admin portal: the UPI accounts checkout's QR code pays. Admins only. */
export default function AdminUpiView() {
  return (
    // Same shape as the Plans page: a header and one table.
    <Suspense fallback={<PlansSkeleton />}>
      <UpiAccounts />
    </Suspense>
  );
}
