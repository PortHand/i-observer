"use client";

import type { Offer } from "../../get-ioverlay/services/getService";
import { pricing } from "../content/homeContent";
import { useOfferCountdown } from "../handler/useOfferCountdown";
import { formatOfferEnd } from "../helper/homeHelper";
import CountdownClock from "./CountdownClock";

/**
 * The admin's offer countdown as a banner over the plans (home page and checkout). When it reaches
 * zero it starts over (when set to restart) or disappears.
 */
export default function OfferCountdown({ offer }: { offer: Offer }) {
  const { deadline, left } = useOfferCountdown(offer);
  if (deadline === null) return null;

  return (
    <section className="offer-banner theme-ink" aria-label={offer.headline}>
      <div className="offer-banner__text">
        <p className="offer-banner__eyebrow">
          <span className="offer-pulse" aria-hidden="true" />
          {pricing.countdown.eyebrow}
        </p>
        <p className="offer-banner__headline">{offer.headline}</p>
        <p className="visually-hidden">{pricing.countdown.endsAt.replace("{date}", formatOfferEnd(deadline))}</p>
      </div>
      <CountdownClock left={left} deadline={deadline} size="large" />
    </section>
  );
}
