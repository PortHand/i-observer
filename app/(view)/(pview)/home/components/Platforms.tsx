import type { CSSProperties } from "react";
import { Check, Clock, Laptop, Monitor, Terminal, X, type LucideIcon } from "lucide-react";
import { homeSections } from "@/helper/route";
import { osSection, osSupport, type OsSupport } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

/** A generic device icon per system, in osSupport order. Decorative only. */
const OS_ICONS: LucideIcon[] = [Laptop, Monitor, Terminal];

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
          {osSupport.map((os, index) => {
            const Icon = OS_ICONS[index % OS_ICONS.length];
            return (
              <li
                key={os.name}
                className={os.comingSoon ? "stat stat--os stat--soon" : "stat stat--os"}
                data-reveal
                data-spotlight
                style={{ "--reveal-order": index } as CSSProperties}
              >
                <span className="icon-tile stat__icon">
                  <Icon className="icon" strokeWidth={1.75} />
                </span>
                <h3 className="display stat__value">{os.name}</h3>
                <span className="stat__label mono">{os.requirement}</span>
                {!os.comingSoon && <span className="stat__label mono">{os.download}</span>}
                <CaptureTag os={os} />
                {os.note && <p className="stat__note text-muted">{os.note}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
