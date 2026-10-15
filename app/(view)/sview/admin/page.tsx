import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard from "./components/Dashboard";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false },
};

/** Admin home: what needs review, and how sales are going over ?range= days. Admins only. */
export default function AdminDashboardView({ searchParams }: PageProps<"/sview/admin">) {
  return (
    <Suspense fallback={null}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}
