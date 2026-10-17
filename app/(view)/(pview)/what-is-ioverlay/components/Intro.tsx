import { homeSections } from "@/helper/route";
import PageHero from "../../home/components/PageHero";
import { factSheet, intro, oneLine } from "../content/whatIsContent";

export default function Intro() {
  return (
    <>
      <section className="band" id={homeSections.top}>
        <PageHero {...intro} className="container" />
      </section>
      <section className="band">
        <div className="container section section--compact summary">
          <p className="callout">
            <strong>{oneLine.label}</strong> {oneLine.text}
          </p>
          <dl className="facts">
            {factSheet.rows.map(({ term, value }) => (
              <div key={term} className="facts__row">
                <dt className="mono">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
