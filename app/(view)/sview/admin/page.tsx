import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import Welcome from "../welcome/components/Welcome";
import { adminPage } from "../welcome/content/welcomeContent";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

/** Landing page for admins. Other accounts are redirected to /welcome. */
export default function AdminView() {
  return (
    <>
      <SiteHeader signedIn current={routes.admin} />
      <main>
        <section className="band">
          <div className="container">
            <Suspense fallback={null}>
              <Welcome role="admin" copy={adminPage} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
