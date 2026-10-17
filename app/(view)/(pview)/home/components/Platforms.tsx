import { Check, Clock, X } from "lucide-react";
import { homeSections } from "@/helper/route";
import { osSection, osSupport, type OsSupport } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

/** Whether capture hides the overlay on this system, or that the system isn't out yet. */
function CaptureTag({ os }: { os: OsSupport }) {
  if (os.comingSoon) {
    return (
      <p className="capture-tag capture-tag--soon">
        <Clock className="icon icon--sm" strokeWidth={2} />
        <span className="mono">{osSection.comingSoon}</span>
      </p>
    );
  }
  return (
    <p className={os.captureHidden ? "capture-tag" : "capture-tag capture-tag--off"}>
      {os.captureHidden ? <Check className="icon icon--sm" strokeWidth={2} /> : <X className="icon icon--sm" strokeWidth={2} />}
      <span className="mono">{os.captureHidden ? osSection.hidden : osSection.visible}</span>
    </p>
  );
}

export default function Platforms() {
  return (
    <section className="band band--light" id={homeSections.platforms}>
      <div className="container section">
        <SectionHeader eyebrow={osSection.eyebrow} title={osSection.title} lead={osSection.lead} />
        <ul className="stats">
          {osSupport.map((os) => (
            <li key={os.name} className={os.comingSoon ? "stat stat--soon" : "stat"}>
              <h3 className="display stat__value">{os.name}</h3>
              <span className="stat__label mono">{os.requirement}</span>
              {!os.comingSoon && <span className="stat__label mono">{os.download}</span>}
              <CaptureTag os={os} />
              {os.note && <p className="stat__note text-muted">{os.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
