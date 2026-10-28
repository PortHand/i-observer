"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { checkoutLink } from "@/helper/route";
import type { Offer } from "../../get-ioverlay/services/getService";
import { pricing } from "../content/homeContent";
import { useOfferCountdown } from "../handler/useOfferCountdown";
import { formatOfferEnd } from "../helper/homeHelper";
import CountdownClock from "./CountdownClock";

/** The offer countdown as a slim bar along the top of every public page, linking to checkout. */
export default function OfferBar({ offer }: { offer: Offer }) {
  const { deadline, left } = useOfferCountdown(offer);
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
