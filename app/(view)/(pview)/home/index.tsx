"use client";

import "./home.css";
import Closing from "./components/Closing";
import Demo from "./components/Demo";
import Hero from "./components/Hero";
import HeroExplainer from "./components/HeroExplainer";
import HowItWorks from "./components/HowItWorks";
import Platforms from "./components/Platforms";
import Pricing from "./components/Pricing";
import Questions from "./components/Questions";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { routes } from "@/helper/route";
import { closing } from "./content/homeContent";
import { useHomeHandler } from "./handler/useHomeHandler";

export default function HomeView() {
  const home = useHomeHandler();

  return (
    <>
      <SiteHeader signedIn={home.user !== null} current={routes.home} />
      <main>
        <Hero>
          <HeroExplainer />
        </Hero>
        <Questions />
        <HowItWorks />
        <Platforms />
        <Demo />
        <Pricing status={home.pricingStatus} onChoose={home.handleChoosePlan} />
        <Closing {...closing} />
      </main>
      <SiteFooter />
    </>
  );
}
