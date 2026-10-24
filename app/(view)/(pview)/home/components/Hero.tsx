import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, MonitorPlay } from "lucide-react";
import { homeSections } from "@/helper/route";
import { hero } from "../content/homeContent";

/** Staggered entrance for the hero's lines as the page loads, in order. */
const stagger = (step: number) => ({ animationDelay: `${step * 90}ms` }) as CSSProperties;

export default function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="hero-band" id={homeSections.top}>
      <div className="hero-bg" aria-hidden="true">
        <span className="hero-bg__orb hero-bg__orb--coral" />
        <span className="hero-bg__orb hero-bg__orb--violet" />
        <span className="hero-bg__orb hero-bg__orb--cyan" />
        <span className="hero-bg__grid" />
        <span className="hero-bg__beam" />
      </div>
      <div className="container hero">
        <div className="hero__copy">
          <Link href={hero.badge.href} className="hero__badge animate-in" style={stagger(0)}>
            <span className="hero__badge-tag">{hero.badge.tag}</span>
            {hero.badge.label}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </Link>
          <h1 className="display hero__title animate-in" style={stagger(1)}>
            {hero.titleStart} <span className="gradient-text">{hero.titleAccent}</span> {hero.titleEnd}
          </h1>
          <p className="lead hero__lead animate-in" style={stagger(2)}>
            {hero.lead}
          </p>
          <div className="hero__actions animate-in" style={stagger(3)}>
            <Link href={hero.primaryCta.href} className="button button--primary button--lg">
              {hero.primaryCta.label}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
            <a href={hero.demoCta.href} className="button button--secondary button--lg">
              <MonitorPlay className="icon icon--sm" strokeWidth={1.75} />
              {hero.demoCta.label}
            </a>
          </div>
          <ul className="hero__trust animate-in" style={stagger(4)}>
            {hero.trust.map((item) => (
              <li key={item}>
                <Check className="icon icon--sm" strokeWidth={2.25} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="hero__stage animate-in animate-in--stage" style={stagger(5)}>
          {children}
        </div>
      </div>
    </section>
  );
}
