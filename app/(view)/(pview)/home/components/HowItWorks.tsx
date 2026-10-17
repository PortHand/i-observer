import { howSection, howSteps, stats } from "../content/homeContent";
import StepList from "./StepList";

export default function HowItWorks() {
  return (
    <section className="band">
      <div className="container section">
        <header className="section__header">
          <h2 className="display section__title">{howSection.title}</h2>
          <p className="lead">{howSection.lead}</p>
        </header>
        <StepList items={howSteps} four />
        <ul className="stats stats--four">
          {stats.map(({ value, label }) => (
            <li key={label} className="stat">
              <span className="display stat__value">{value}</span>
              <span className="stat__label mono">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
