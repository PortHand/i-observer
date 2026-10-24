"use client";

// The hero's live demo: a mock meeting window with the overlay floating over it. It flips between
// "On your screen" (overlay visible, notes typing in) and "What they see" (overlay dropped from
// the capture) every few seconds, until the visitor picks a view themselves. Visitors who prefer
// reduced motion get the switch without the automatic flipping.

import { useEffect, useState, type CSSProperties } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { heroExplainer } from "../content/homeContent";

type View = "yours" | "theirs";

const FLIP_MS = 4800;
const BARS = [38, 52, 46, 64, 58, 82];

export default function HeroExplainer() {
  /** Each flip adds one: even steps show your screen, odd steps what viewers see. */
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const view: View = step % 2 === 0 ? "yours" : "theirs";
  /** Changes each time the overlay comes back, to replay the notes typing in. */
  const round = Math.floor(step / 2);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep((value) => value + 1), FLIP_MS);
    return () => window.clearInterval(timer);
  }, [auto]);

  const pick = (next: View) => {
    setAuto(false);
    if (next !== view) setStep((value) => value + 1);
  };

  return (
    <figure className={`stage stage--${view}`}>
      <div className="stage__toolbar">
        <span className="stage__label mono">{heroExplainer.label}</span>
        <div className="stage__switch" role="group" aria-label={heroExplainer.viewLabel}>
          <span className="stage__switch-thumb" aria-hidden="true" />
          <button type="button" aria-pressed={view === "yours"} onClick={() => pick("yours")}>
            <Eye className="icon icon--sm" strokeWidth={1.75} />
            {heroExplainer.yours}
          </button>
          <button type="button" aria-pressed={view === "theirs"} onClick={() => pick("theirs")}>
            <EyeOff className="icon icon--sm" strokeWidth={1.75} />
            {heroExplainer.theirs}
          </button>
        </div>
      </div>

      <div className="stage__window" aria-hidden="true">
        <div className="stage__titlebar">
          <span className="stage__dots">
            <span />
            <span />
            <span />
          </span>
          <span className="stage__meeting">{heroExplainer.meeting}</span>
          <span className="stage__live mono">
            <span className="stage__live-dot" />
            {heroExplainer.live}
          </span>
        </div>

        <div className="stage__body">
          <div className="stage__slide">
            <span className="stage__slide-title">{heroExplainer.slideTitle}</span>
            <span className="stage__line" />
            <span className="stage__line stage__line--short" />
            <span className="stage__chart">
              {BARS.map((height, index) => (
                <span key={index} style={{ "--h": `${height}%`, "--i": index } as CSSProperties} />
              ))}
            </span>
          </div>

          <div className="stage__people">
            {heroExplainer.participants.map((initials, index) => (
              <span key={initials} className={index === 0 ? "stage__person stage__person--speaking" : "stage__person"}>
                {initials}
              </span>
            ))}
          </div>

          <div className="stage__overlay">
            <div className="stage__overlay-head">
              <span className="stage__overlay-logo" />
              <span className="stage__overlay-title">{heroExplainer.overlayTitle}</span>
              <span className="stage__overlay-tag mono">
                <Lock className="icon" strokeWidth={2} />
                {heroExplainer.hidden}
              </span>
            </div>
            <ul key={round} className="stage__notes">
              {heroExplainer.notes.map((note, index) => (
                <li key={note} style={{ "--i": index } as CSSProperties}>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <div className="stage__overlay-foot">
              <span className="mono">{heroExplainer.opacity}</span>
              <span className="stage__slider">
                <span />
              </span>
              <span className="keys">
                <kbd>⌥</kbd>
                <kbd>⇧</kbd>
                <kbd>G</kbd>
              </span>
            </div>
          </div>

          <div className="stage__ghost">
            <EyeOff className="icon" strokeWidth={1.75} />
            <span className="mono">{heroExplainer.hidden}</span>
          </div>
          <span className="stage__scan" />
        </div>
      </div>

      <figcaption className="stage__caption">
        <span className={view === "yours" ? "is-active" : undefined}>{heroExplainer.yours}</span>
        <span className="stage__caption-rule" />
        <span>{heroExplainer.caption}</span>
        <span className="stage__caption-rule" />
        <span className={view === "theirs" ? "is-active" : undefined}>{heroExplainer.theirs}</span>
      </figcaption>
    </figure>
  );
}
