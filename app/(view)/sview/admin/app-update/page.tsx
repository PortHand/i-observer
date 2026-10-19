import type { Metadata } from "next";
import { Suspense } from "react";
import AppUpdate from "../components/AppUpdate";
import AppUpdateSkeleton from "../components/AppUpdateSkeleton";

export const metadata: Metadata = {
  title: "Admin · Force update",
  robots: { index: false },
};

/** Admin portal: force users of older desktop app versions to update. Admins only. */
export default function AdminAppUpdateView() {
  return (
    <Suspense fallback={<AppUpdateSkeleton />}>
      <AppUpdate />
    </Suspense>
  );
}
