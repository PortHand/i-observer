"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { checkoutLink } from "@/helper/route";
import type { Offer } from "../../get-ioverlay/services/getService";
import { pricing } from "../content/homeContent";
import { useOfferCountdown } from "../handler/useOfferCountdown";
import { formatOfferEnd } from "../helper/homeHelper";
import CountdownClock from "./CountdownClock";

/**
 * The last offer this tab rendered. Each page streams its own header, so during a client navigation
 * the bar would vanish until the new page's offer arrives; OfferBarFallback shows this one instead.
 */
let lastOffer: Offer | null = null;

/** The offer countdown as a slim bar along the top of every public page, linking to checkout. */
export default function OfferBar({ offer }: { offer: Offer }) {
  const { deadline, left } = useOfferCountdown(offer);
  useEffect(() => {
    lastOffer = offer;
  }, [offer]);
  if (deadline === null) return null;

  return (
    <div className="offer-bar theme-ink" role="region" aria-label={pricing.countdown.eyebrow}>
      <div className="container offer-bar__inner">
        <p className="offer-bar__headline">
          <span className="offer-pulse" aria-hidden="true" />
          {offer.headline}
          <span className="visually-hidden"> {pricing.countdown.endsAt.replace("{date}", formatOfferEnd(deadline))}</span>
        </p>
        <CountdownClock left={left} deadline={deadline} size="compact" />
        <Link href={checkoutLink} className="offer-bar__link">
          {pricing.countdown.viewPlans}
          <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

/**
 * The Suspense fallback for OfferBarLoader: the bar as last seen, so it stays put while a navigation
 * streams in. Nothing on the first visit, when no offer has been seen yet.
 */
export function OfferBarFallback() {
  return lastOffer ? <OfferBar offer={lastOffer} /> : null;
}
