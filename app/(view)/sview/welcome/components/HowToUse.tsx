import { CircleAlert } from "lucide-react";
import SectionHeader from "../../../(pview)/home/components/SectionHeader";
import StepList from "../../../(pview)/home/components/StepList";
import { howTo } from "../content/welcomeContent";

/** Install → sign in → open → share, plus first-launch warnings each system shows. */
export default function HowToUse() {
  return (
    <section className="band" id="how-to-use">
      <div className="container section">
        <SectionHeader eyebrow={howTo.eyebrow} title={howTo.title} lead={howTo.lead} />
        <StepList items={howTo.steps} four />
        <div className="first-run">
          <span className="section-label">{howTo.firstRun.title}</span>
          <ul className="list">
            {howTo.firstRun.items.map((item) => (
              <li key={item}>
                <CircleAlert className="icon list__icon" strokeWidth={1.75} />
                <span className="list__label">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
