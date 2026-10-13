import { howSection, howSteps, stats } from "../content/homeContent";

export default function HowItWorks() {
  return (
    <section className="band">
      <div className="container section">
        <header className="section__header">
          <h2 className="display section__title">{howSection.title}</h2>
          <p className="lead">{howSection.lead}</p>
        </header>
        <ol className="steps steps--four">
          {howSteps.map(({ label, description }, index) => (
            <li key={label} className="step">
              <span className="step__label mono">
                {String(index + 1).padStart(2, "0")} · {label}
              </span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ol>
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
