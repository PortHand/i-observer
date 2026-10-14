import { ArrowDown } from "lucide-react";
import { homeSections } from "@/helper/route";
import { checkoutSectionId, getApp, getSteps } from "../content/getContent";

export default function Steps() {
  return (
    <section className="band" id={homeSections.top}>
      <div className="container section">
        <header className="section__header animate-in">
          <div className="stack-sm">
            <span className="eyebrow">{getApp.eyebrow}</span>
            <h1 className="display section__title">{getApp.title}</h1>
          </div>
          <div className="stack-sm">
            <p className="lead">{getApp.lead}</p>
            <a className="button button--primary steps__cta" href={`#${checkoutSectionId}`}>
              Start checkout
              <ArrowDown className="icon icon--sm" strokeWidth={1.75} />
            </a>
          </div>
        </header>

        <ol className="steps steps--four">
          {getSteps.map(({ title, description }, index) => (
            <li key={title} className="step">
              <span className="step__label mono">
                {String(index + 1).padStart(2, "0")} · {title}
              </span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
