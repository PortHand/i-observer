"use client";

import "./home.css";
import Demo from "./components/Demo";
import Features from "./components/Features";
import Hero from "./components/Hero";
import HeroExplainer from "./components/HeroExplainer";
import Pricing from "./components/Pricing";
import Shortcuts from "./components/Shortcuts";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { useHomeHandler } from "./handler/useHomeHandler";

export default function HomeView() {
  const home = useHomeHandler();

  return (
    <>
      <SiteHeader signedIn={home.user !== null} />
      <main>
        <Hero>
          <HeroExplainer />
        </Hero>
        <Features />
        <Demo />
        <Pricing status={home.pricingStatus} onChoose={home.handleChoosePlan} />
        <Shortcuts platform={home.platform} />
      </main>
      <SiteFooter />
    </>
  );
}
