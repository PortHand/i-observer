import { homeSections } from "@/helper/route";
import { factSheet, intro, oneLine } from "../content/whatIsContent";

export default function Intro() {
  return (
    <>
      <section className="band" id={homeSections.top}>
        <div className="container page-hero animate-in">
          <span className="eyebrow">{intro.eyebrow}</span>
          <h1 className="display page-hero__title">{intro.title}</h1>
          <p className="lead page-hero__lead">{intro.lead}</p>
        </div>
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
