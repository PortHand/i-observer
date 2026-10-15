import type { Metadata } from "next";
import { Suspense } from "react";
import OrderDetail from "../../components/OrderDetail";

export const metadata: Metadata = {
  title: "Admin · Order",
  robots: { index: false },
};

/** One order and its payment review. Admins only. */
export default function AdminOrderView({ params }: PageProps<"/sview/admin/orders/[reference]">) {
  return (
    <Suspense fallback={null}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
