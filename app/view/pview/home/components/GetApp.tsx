import { getApp, getSteps } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

export default function GetApp() {
  return (
    <section className="band" id="get">
      <div className="container section">
        <SectionHeader eyebrow={getApp.eyebrow} title={getApp.title} lead={getApp.lead} />

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
