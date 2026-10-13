import { CircleAlert } from "lucide-react";
import SectionHeader from "../../home/components/SectionHeader";
import { hidingSection, hidingSteps, limits } from "../content/whatIsContent";

export default function Hiding() {
  return (
    <section className="band" id="how-it-hides">
      <div className="container section">
        <SectionHeader {...hidingSection} />
        <ol className="steps">
          {hidingSteps.map(({ title, description }, index) => (
            <li key={title} className="step">
              <span className="step__label mono">
                {String(index + 1).padStart(2, "0")} · {title}
              </span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ol>
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
