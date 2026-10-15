import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard from "./components/Dashboard";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false },
};

/** Admin home: what needs review, and how sales are going. Admins only. */
export default function AdminDashboardView() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
