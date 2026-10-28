"use client";

import { useSyncExternalStore } from "react";
import type { Offer } from "../../get-ioverlay/services/getService";
import { offerDeadline, splitCountdown } from "../helper/homeHelper";

/** Ticks once a second. The snapshot is the current whole second, so it only changes on a tick. */
const subscribeSeconds = (tick: () => void) => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;
/** On the server, and while hydrating, the time isn't known: the digits show as dashes. */
const noTime = () => null;

/**
 * The offer's countdown, ticking each second: when it next reaches zero (it starts over when set
 * to restart), and the time left, null until the browser's clock is read. `deadline` is null once
 * it has run out for good, and the countdown should disappear.
 */
export const useOfferCountdown = (offer: Offer) => {
  const now = useSyncExternalStore(subscribeSeconds, currentSecond, noTime);
  const endsAt = Date.parse(offer.endsAt);
  const deadline = now === null ? endsAt : offerDeadline(endsAt, offer.restartHours, now);
  const left = now === null || deadline === null ? null : splitCountdown(deadline - now);
  return { deadline, left };
};

export type CountdownLeft = ReturnType<typeof splitCountdown>;
