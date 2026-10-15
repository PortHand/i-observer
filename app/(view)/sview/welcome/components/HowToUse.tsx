import { CircleAlert } from "lucide-react";
import SectionHeader from "../../../(pview)/home/components/SectionHeader";
import { howTo } from "../content/welcomeContent";

/** Install → sign in → open → share, plus first-launch warnings each system shows. */
export default function HowToUse() {
  return (
    <section className="band" id="how-to-use">
      <div className="container section">
        <SectionHeader eyebrow={howTo.eyebrow} title={howTo.title} lead={howTo.lead} />
        <ol className="steps steps--four">
          {howTo.steps.map(({ icon: Icon, label, description }, index) => (
            <li key={label} className="step">
              <span className="step__label mono">
                <Icon className="icon icon--sm step__icon" strokeWidth={1.75} />
                {String(index + 1).padStart(2, "0")} · {label}
              </span>
              <p className="text-muted">{description}</p>
            </li>
          ))}
        </ol>
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
