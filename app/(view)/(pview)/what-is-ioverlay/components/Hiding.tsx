import { CircleAlert } from "lucide-react";
import SectionHeader from "../../home/components/SectionHeader";
import StepList from "../../home/components/StepList";
import { hidingSection, hidingSteps, limits } from "../content/whatIsContent";

const steps = hidingSteps.map(({ title, description }) => ({ label: title, description }));

export default function Hiding() {
  return (
    <section className="band" id="how-it-hides">
      <div className="container section">
        <SectionHeader {...hidingSection} />
        <StepList items={steps} />
        <div className="limits">
          <h3 className="limits__title mono">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            {limits.title}
          </h3>
          <ul>
            {limits.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
