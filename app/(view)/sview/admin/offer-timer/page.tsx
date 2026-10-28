import type { Metadata } from "next";
import { Suspense } from "react";
import AppUpdateSkeleton from "../components/AppUpdateSkeleton";
import OfferTimer from "../components/OfferTimer";

export const metadata: Metadata = {
  title: "Admin · Offer timer",
  robots: { index: false },
};

/** Admin portal: the "Offer ends in" countdown over the plans. Admins only. */
export default function AdminOfferTimerView() {
  return (
    // Same shape as the Force update page: a header and one form card.
    <Suspense fallback={<AppUpdateSkeleton />}>
      <OfferTimer />
    </Suspense>
  );
}
