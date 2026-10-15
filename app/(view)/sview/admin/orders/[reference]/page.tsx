import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../../../(pview)/home/components/SiteHeader";
import OrderDetail from "../../components/OrderDetail";

export const metadata: Metadata = {
  title: "Admin · Order",
  robots: { index: false },
};

/** One order and its payment review. Admins only. */
export default function AdminOrderView({ params }: PageProps<"/sview/admin/orders/[reference]">) {
  return (
    <>
      <SiteHeader signedIn current={routes.admin} />
      <main>
        <section className="band">
          <div className="container admin">
            <Suspense fallback={null}>
              <OrderDetail params={params} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
