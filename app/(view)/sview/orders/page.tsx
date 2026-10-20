import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import Orders from "./components/Orders";
import OrdersSkeleton from "./components/OrdersSkeleton";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false },
};

/** The signed-in customer's orders and payments, with each one's status. */
export default function OrdersView() {
  return (
    <>
      <SiteHeader current={routes.orders} />
      <main>
        <section className="band">
          <div className="container">
            <Suspense fallback={<OrdersSkeleton />}>
              <Orders />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
