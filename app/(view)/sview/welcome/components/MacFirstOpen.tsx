import { TriangleAlert } from "lucide-react";
import SectionHeader from "../../../(pview)/home/components/SectionHeader";
import { macOpen } from "../content/welcomeContent";
import MacOpenShot from "./MacOpenShot";

/** The one-time Gatekeeper steps for the first launch on a Mac, each with a picture of the screen. */
export default function MacFirstOpen() {
  return (
    <section className="band band--light" id={macOpen.id}>
      <div className="container section">
        <SectionHeader eyebrow={macOpen.eyebrow} title={macOpen.title} lead={macOpen.lead} />
        <ol className="mac-open">
          {macOpen.steps.map((step, index) => (
            <li key={step.shot} className="mac-open__step">
              <MacOpenShot shot={step.shot} />
              <div className="stack-sm">
                <span className="section-label">Step {index + 1}</span>
                <h3 className="mac-open__title">{step.title}</h3>
                <p className="text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mac-open__damaged">
          <span className="section-label">
            <TriangleAlert className="icon icon--sm" strokeWidth={1.75} />
            {macOpen.damaged.title}
          </span>
          <p className="text-muted">{macOpen.damaged.text}</p>
          <code className="mac-open__command">{macOpen.damaged.command}</code>
        </div>
      </div>
    </section>
  );
}
