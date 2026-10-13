import { homeSections } from "@/helper/route";
import { getApp, getSteps } from "../content/getContent";

export default function Steps() {
  return (
    <section className="band" id={homeSections.top}>
      <div className="container section">
        <header className="section__header animate-in">
          <div className="stack-sm">
            <span className="eyebrow">{getApp.eyebrow}</span>
            <h1 className="display section__title">{getApp.title}</h1>
          </div>
          <p className="lead">{getApp.lead}</p>
        </header>

        <ol className="steps">
          {getSteps.map(({ title, description }, index) => (
            <li key={title} className="step">
              <span className="step__label mono">
                {String(index + 1).padStart(2, "0")} · {title}
              </span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ol>

        <dl className="payment mono">
          <div>
            <dt>UPI ID</dt>
            <dd>{getApp.upiId}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
