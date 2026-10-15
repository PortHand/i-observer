import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard from "./components/Dashboard";
import DashboardSkeleton from "./components/DashboardSkeleton";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false },
};

/** Admin home: what needs review, and how sales are going over ?range= days. Admins only. */
export default function AdminDashboardView({ searchParams }: PageProps<"/sview/admin">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}
