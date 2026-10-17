import type { Metadata } from "next";
import { Suspense } from "react";
import "./sign-in.css";
import { routes } from "@/helper/route";
import { pageMetadata } from "@/helper/seo";
import SiteFooter from "../home/components/SiteFooter";
import PageHero from "../home/components/PageHero";
import SiteHeader from "../home/components/SiteHeader";
import LoginHelp from "./components/LoginHelp";
import LowestPrice, { LowestPriceSkeleton } from "./components/LowestPrice";
import SignInSection from "./components/SignInSection";
import { intro } from "./content/signInContent";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to iOverlay with the username and password emailed after your purchase, or buy iOverlay.",
  path: routes.signIn,
  // An account page, not something to find in search; its links are still followed.
  index: false,
});

export default function SignInView() {
  return (
    <>
      <SiteHeader current={routes.signIn} />
      <main>
        <section className="band">
          <div className="container sign-in">
            <div className="sign-in__intro">
              <PageHero {...intro} />
              <LoginHelp />
            </div>
            <SignInSection
              price={
                <Suspense fallback={<LowestPriceSkeleton />}>
                  <LowestPrice />
                </Suspense>
              }
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
