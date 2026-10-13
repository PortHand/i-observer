import type { ReactNode } from "react";
import { ArrowRight, MonitorPlay } from "lucide-react";
import { homeSection, homeSections } from "@/helper/route";
import { hero } from "../content/homeContent";

export default function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="band" id={homeSections.top}>
      <div className="container hero">
        <div className="hero__copy animate-in">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1 className="display hero__title">
            {hero.titleStart} <span className="accent">{hero.titleAccent}</span> {hero.titleEnd}
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="hero__actions">
            <a href={homeSection("demo")} className="button button--secondary">
              <MonitorPlay className="icon icon--sm" strokeWidth={1.75} />
              {hero.demoCta}
            </a>
            <a href={homeSection("pricing")} className="button button--ghost">
              {hero.pricingCta}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </a>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
