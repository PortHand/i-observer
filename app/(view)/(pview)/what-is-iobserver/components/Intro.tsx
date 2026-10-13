import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeSections } from "@/helper/route";
import { factSheet, intro } from "../content/whatIsContent";

export default function Intro() {
  return (
    <section className="band" id={homeSections.top}>
      <div className="container hero">
        <div className="hero__copy animate-in">
          <span className="eyebrow">{intro.eyebrow}</span>
          <h1 className="display hero__title">
            {intro.titleStart} <span className="accent">{intro.titleAccent}</span> {intro.titleEnd}
          </h1>
          <p className="lead">{intro.lead}</p>
          <div className="hero__actions">
            <Link href={intro.primaryCta.href} className="button button--primary">
              {intro.primaryCta.label}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
            <Link href={intro.secondaryCta.href} className="button button--secondary">
              {intro.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="card facts theme-ink animate-in animate-in--delayed">
          <span className="mono accent facts__label">{factSheet.label}</span>
          <dl className="facts__list">
            {factSheet.rows.map(({ term, value }) => (
              <div key={term} className="facts__row">
                <dt className="mono">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
