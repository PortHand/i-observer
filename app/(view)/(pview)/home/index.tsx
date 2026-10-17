import type { ReactNode } from "react";
import Closing from "./components/Closing";
import Demo from "./components/Demo";
import Hero from "./components/Hero";
import HeroExplainer from "./components/HeroExplainer";
import HowItWorks from "./components/HowItWorks";
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
