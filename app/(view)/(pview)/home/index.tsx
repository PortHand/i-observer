import type { ReactNode } from "react";
import Closing from "./components/Closing";
import Demo from "./components/Demo";
import Features from "./components/Features";
import Hero from "./components/Hero";
import HeroExplainer from "./components/HeroExplainer";
import HomeFaq from "./components/HomeFaq";
import HowItWorks from "./components/HowItWorks";
import Marquee from "./components/Marquee";
import Platforms from "./components/Platforms";
import Questions from "./components/Questions";
import SiteFooter from "./components/SiteFooter";
import { closing } from "./content/homeContent";

interface HomeViewProps {
  /** The site header, rendered on the server because its account button reads the session. */
  header: ReactNode;
  /** The pricing section, rendered on the server because it reads plans from the database. */
  pricing: ReactNode;
}

export default function HomeView({ header, pricing }: HomeViewProps) {
  return (
    <>
      {header}
      <main>
        <Hero>
          <HeroExplainer />
        </Hero>
        <Marquee />
        <Features />
        <HowItWorks />
        <Demo />
        <Questions />
        <Platforms />
        {pricing}
        <HomeFaq />
        <Closing {...closing} />
      </main>
      <SiteFooter />
    </>
  );
}
