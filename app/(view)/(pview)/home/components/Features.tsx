import type { CSSProperties } from "react";
import { MousePointer2, Sparkles } from "lucide-react";
import { features, featuresSection, type FeatureVisual } from "../content/homeContent";
import SectionHeader from "./SectionHeader";

/** The small animated illustration at the top of each feature card. Decorative only. */
function Visual({ kind }: { kind: FeatureVisual }) {
  switch (kind) {
    case "capture":
      return (
        <div className="fv fv--capture">
          <div className="fv-screen">
            <span className="fv-screen__tag mono">You</span>
            <span className="fv-screen__line" />
            <span className="fv-screen__line fv-screen__line--short" />
            <span className="fv-screen__panel" />
          </div>
          <span className="fv-capture__arrow" />
          <div className="fv-screen fv-screen--theirs">
            <span className="fv-screen__tag mono">Them</span>
            <span className="fv-screen__line" />
            <span className="fv-screen__line fv-screen__line--short" />
            <span className="fv-screen__hole" />
          </div>
        </div>
      );
    case "browser":
      return (
        <div className="fv fv--browser">
          <div className="fv-browser__bar">
            <span className="fv-browser__dots" />
            <span className="fv-browser__url mono">
              <span>notes.example.com</span>
            </span>
          </div>
          <div className="fv-browser__page">
            <span />
            <span />
            <span />
          </div>
        </div>
      );
    case "opacity":
      return (
        <div className="fv fv--opacity">
          <div className="fv-opacity__panel">
            <span />
            <span />
          </div>
          <div className="fv-opacity__track">
            <span className="fv-opacity__knob" />
          </div>
          <div className="fv-opacity__scale mono">
            <span>30%</span>
            <span>100%</span>
          </div>
        </div>
      );
    case "clickThrough":
      return (
        <div className="fv fv--click">
          <span className="fv-click__app">
            <span className="fv-click__button" />
          </span>
          <span className="fv-click__panel" />
          <MousePointer2 className="fv-click__cursor" strokeWidth={1.5} />
          <span className="fv-click__ripple" />
        </div>
      );
    case "shortcuts":
      return (
        <div className="fv fv--keys">
          {["⌥", "⇧", "G"].map((key, index) => (
            <kbd key={key} style={{ "--i": index } as CSSProperties}>
              {key}
            </kbd>
          ))}
        </div>
      );
    case "ai":
      return (
        <div className="fv fv--ai">
          <span className="fv-ai__bubble fv-ai__bubble--you" />
          <span className="fv-ai__bubble">
            <Sparkles className="icon icon--sm" strokeWidth={1.75} />
            <span className="fv-ai__typing">
              <span />
              <span />
              <span />
            </span>
          </span>
        </div>
      );
  }
}

export default function Features() {
  return (
    <section className="band" id="features">
      <div className="container section">
        <SectionHeader {...featuresSection} />
        <ul className="bento">
          {features.map(({ title, description, icon: Icon, visual, span, tag }, index) => (
            <li
              key={title}
              className={span ? `bento__card bento__card--span-${span}` : "bento__card"}
              data-reveal
              data-spotlight
              style={{ "--reveal-order": index % 3 } as CSSProperties}
            >
              <Visual kind={visual} />
              <div className="bento__text">
                <h3 className="bento__title">
                  <Icon className="icon bento__icon" strokeWidth={1.75} />
                  {title}
                  {tag && <span className="bento__tag mono">{tag}</span>}
                </h3>
                <p className="text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
