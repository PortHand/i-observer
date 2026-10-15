"use client";

import type { ReactNode } from "react";
import Closing from "./components/Closing";
import Demo from "./components/Demo";
import Hero from "./components/Hero";
import HeroExplainer from "./components/HeroExplainer";
import HowItWorks from "./components/HowItWorks";
import Platforms from "./components/Platforms";
import Questions from "./components/Questions";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { routes } from "@/helper/route";
import { closing } from "./content/homeContent";
import { useHomeHandler } from "./handler/useHomeHandler";

interface HomeViewProps {
  /** The pricing section, rendered on the server because it reads plans from the database. */
  pricing: ReactNode;
}

export default function HomeView({ pricing }: HomeViewProps) {
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
        {pricing}
        <Closing {...closing} />
      </main>
      <SiteFooter />
    </>
  );
}
