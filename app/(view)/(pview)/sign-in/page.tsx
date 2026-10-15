import type { Metadata } from "next";
import { Suspense } from "react";
import "./sign-in.css";
import { routes } from "@/helper/route";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import LoginHelp from "./components/LoginHelp";
import LowestPrice from "./components/LowestPrice";
import SignInSection from "./components/SignInSection";
import { intro } from "./content/signInContent";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to iOverlay with the username and password emailed after your purchase, or buy iOverlay.",
};

export default function SignInView() {
  return (
    <>
      <SiteHeader current={routes.signIn} />
      <main>
        <section className="band">
          <div className="container sign-in">
            <div className="sign-in__intro">
              <div className="page-hero animate-in">
                <span className="eyebrow">{intro.eyebrow}</span>
                <h1 className="display page-hero__title">{intro.title}</h1>
                <p className="lead page-hero__lead">{intro.lead}</p>
              </div>
              <LoginHelp />
            </div>
            <SignInSection
              price={
                <Suspense fallback={null}>
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
