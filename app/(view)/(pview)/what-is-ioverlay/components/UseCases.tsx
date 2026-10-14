import SectionHeader from "../../home/components/SectionHeader";
import { useCases, useCasesSection } from "../content/whatIsContent";

export default function UseCases() {
  return (
    <section className="band band--light" id="who">
      <div className="container section">
        <SectionHeader {...useCasesSection} />
        <ul className="steps steps--four">
          {useCases.map(({ label, description }) => (
            <li key={label} className="step">
              <span className="step__label mono">{label}</span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
