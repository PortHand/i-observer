import type { ReactNode } from "react";
import { ArrowRight, MonitorPlay } from "lucide-react";
import { hero } from "../content/homeContent";

export default function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="band" id="top">
      <div className="container hero">
        <div className="hero__copy animate-in">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1 className="display hero__title">
            {hero.titleStart} <span className="accent">{hero.titleAccent}</span> {hero.titleEnd}
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="hero__actions">
            <a href="#demo" className="button button--secondary">
              <MonitorPlay className="icon icon--sm" strokeWidth={1.75} />
              {hero.demoCta}
            </a>
            <a href="#pricing" className="button button--ghost">
              {hero.pricingCta}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </a>
          </div>
          <p className="fineprint mono">{hero.fineprint}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
