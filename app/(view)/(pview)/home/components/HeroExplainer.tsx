import { EyeOff } from "lucide-react";
import { heroExplainer } from "../content/homeContent";

/** A mock shared screen: slide content, with the overlay either on top or dropped from capture. */
function Screen({ label, captured }: { label: string; captured: boolean }) {
  return (
    <figure className="screen">
      <figcaption className="screen__label mono">
        {captured ? label : <span className="accent">{label}</span>}
      </figcaption>
      <div className="screen__frame" aria-hidden="true">
        <div className="screen__bar">
          <span />
          <span />
          <span />
        </div>
        <div className="screen__slide">
          <span className="screen__line screen__line--title" />
          <span className="screen__line" />
          <span className="screen__line screen__line--short" />
          <span className="screen__chart">
            <span style={{ height: "40%" }} />
            <span style={{ height: "65%" }} />
            <span style={{ height: "50%" }} />
            <span style={{ height: "85%" }} />
          </span>
        </div>
        {captured ? (
          <div className="screen__ghost">
            <EyeOff className="icon icon--sm" strokeWidth={1.75} />
            <span className="mono">{heroExplainer.hidden}</span>
          </div>
        ) : (
          <div className="screen__overlay">
            <span className="screen__overlay-title mono">{heroExplainer.overlayTitle}</span>
            <ul>
              {heroExplainer.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </figure>
  );
}

export default function HeroExplainer() {
  return (
    <div className="card explainer theme-ink animate-in animate-in--delayed">
      <span className="mono accent explainer__label">{heroExplainer.label}</span>
      <Screen label={heroExplainer.yours} captured={false} />
      <Screen label={heroExplainer.theirs} captured />
      <p className="explainer__caption text-muted">{heroExplainer.caption}</p>
    </div>
  );
}
