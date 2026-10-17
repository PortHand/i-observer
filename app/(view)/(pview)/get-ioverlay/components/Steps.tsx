import { ArrowDown } from "lucide-react";
import { homeSections } from "@/helper/route";
import StepList from "../../home/components/StepList";
import { checkoutSectionId, getApp, getSteps } from "../content/getContent";

const steps = getSteps.map(({ title, description }) => ({ label: title, description }));

export default function Steps() {
  return (
    <section className="band" id={homeSections.top}>
      <div className="container section">
        <header className="section__header animate-in">
          <div className="stack-sm">
            <span className="eyebrow">{getApp.eyebrow}</span>
            <h1 className="display section__title">{getApp.title}</h1>
          </div>
          <div className="stack-sm">
            <p className="lead">{getApp.lead}</p>
            <a className="button button--primary steps__cta" href={`#${checkoutSectionId}`}>
              Start checkout
              <ArrowDown className="icon icon--sm" strokeWidth={1.75} />
            </a>
          </div>
        </header>

        <StepList items={steps} four />
      </div>
    </section>
  );
}
