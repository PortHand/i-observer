import type { Metadata } from "next";
import { Suspense } from "react";
import AdminOrders from "../components/AdminOrders";
import OrdersPageSkeleton from "../components/OrdersPageSkeleton";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false },
};

/** Admin portal: orders by status, to review submitted payments. Admins only. */
export default function AdminView({ searchParams }: PageProps<"/sview/admin/orders">) {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <AdminOrders searchParams={searchParams} />
    </Suspense>
  );
}
