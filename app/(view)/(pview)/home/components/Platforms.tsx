import { Check, X } from "lucide-react";
import { homeSections } from "@/helper/route";
import { osSection, osSupport } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

export default function Platforms() {
  return (
    <section className="band band--light" id={homeSections.platforms}>
      <div className="container section">
        <SectionHeader eyebrow={osSection.eyebrow} title={osSection.title} lead={osSection.lead} />
        <ul className="stats">
          {osSupport.map(({ name, requirement, download, captureHidden, note }) => (
            <li key={name} className="stat">
              <h3 className="display stat__value">{name}</h3>
              <span className="stat__label mono">{requirement}</span>
              <span className="stat__label mono">{download}</span>
              <p className={captureHidden ? "capture-tag" : "capture-tag capture-tag--off"}>
                {captureHidden ? (
                  <Check className="icon icon--sm" strokeWidth={2} />
                ) : (
                  <X className="icon icon--sm" strokeWidth={2} />
                )}
                <span className="mono">{captureHidden ? osSection.hidden : osSection.visible}</span>
              </p>
              {note && <p className="stat__note text-muted">{note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
