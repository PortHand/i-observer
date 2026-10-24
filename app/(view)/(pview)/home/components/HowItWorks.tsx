import { howSection, howSteps, stats } from "../content/homeContent";
import type { CSSProperties } from "react";
import SectionHeader from "./SectionHeader";
import StepList from "./StepList";

export default function HowItWorks() {
  return (
    <section className="band">
      <div className="container section">
        <SectionHeader {...howSection} />
        <StepList items={howSteps} four />
        <ul className="stats stats--four">
          {stats.map(({ value, label }, index) => (
            <li key={label} className="stat" data-reveal style={{ "--reveal-order": index } as CSSProperties}>
              <span className="display stat__value gradient-text">{value}</span>
              <span className="stat__label mono">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
