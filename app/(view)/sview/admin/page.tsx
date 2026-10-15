import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import AdminOrders from "./components/AdminOrders";
import { portal } from "./content/adminContent";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false },
};

/** Admin portal: every order by status, to review submitted payments. Admins only. */
export default function AdminView({ searchParams }: PageProps<"/sview/admin">) {
  return (
    <>
      <SiteHeader signedIn current={routes.admin} />
      <main>
        <section className="band">
          <div className="container admin">
            <div className="page-hero">
              <span className="eyebrow">{portal.eyebrow}</span>
              <h1 className="display page-hero__title">{portal.title}</h1>
              <p className="lead page-hero__lead">{portal.lead}</p>
            </div>
            <Suspense fallback={null}>
              <AdminOrders searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
