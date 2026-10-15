import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/helper/route";
import SiteFooter from "../../(pview)/home/components/SiteFooter";
import SiteHeader from "../../(pview)/home/components/SiteHeader";
import Welcome from "./components/Welcome";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false },
};

/** Landing page for any signed-in account. */
export default function WelcomeView() {
  return (
    <>
      <SiteHeader signedIn current={routes.welcome} />
      <main>
        <section className="band">
          <div className="container">
            <Suspense fallback={null}>
              <Welcome />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
