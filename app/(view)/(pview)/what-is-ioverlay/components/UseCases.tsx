import SectionHeader from "../../home/components/SectionHeader";
import StepList from "../../home/components/StepList";
import { useCases, useCasesSection } from "../content/whatIsContent";

export default function UseCases() {
  return (
    <section className="band band--light" id="who">
      <div className="container section">
        <SectionHeader {...useCasesSection} />
        <StepList items={useCases} numbered={false} />
      </div>
    </section>
  );
}
