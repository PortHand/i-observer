import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MonitorPlay } from "lucide-react";
import { homeSections } from "@/helper/route";
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
            <Link href={hero.primaryCta.href} className="button button--primary">
              {hero.primaryCta.label}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
            <a href={hero.demoCta.href} className="button button--secondary">
              <MonitorPlay className="icon icon--sm" strokeWidth={1.75} />
              {hero.demoCta.label}
            </a>
          </div>
          <p className="fineprint mono">{hero.fineprint}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
