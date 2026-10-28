import { OFFER_HEADLINE_MAX, OFFER_TIMER_DEFAULT_HOURS, OFFER_TIMER_MAX_HOURS, offerTimerPage } from "../content/adminContent";
import type { OfferTimerView } from "../services/adminService";
import { istInputToDate, toIstInput } from "./planHelper";

export type OfferTimerField = "headline" | "endsAt" | "durationHours";

/** The Offer timer form as typed: the end time and hours stay strings until parseOfferTimerForm reads them. */
export interface OfferTimerInput {
  enabled: boolean;
  headline: string;
  /** datetime-local value in IST. */
  endsAt: string;
  durationHours: string;
  autoRestart: boolean;
}

/** The timer as the server saves it. `endsAt` is null on a reset: the server starts it from now. */
export interface OfferTimerChange {
  enabled: boolean;
  headline: string;
  endsAt: Date | null;
  durationHours: number;
  autoRestart: boolean;
}

export type OfferTimerParse = { ok: true; change: OfferTimerChange } | { ok: false; errors: Partial<Record<OfferTimerField, string>> };

export const emptyOfferTimerInput = (): OfferTimerInput => ({
  enabled: false,
  headline: offerTimerPage.defaultHeadline,
  endsAt: "",
  durationHours: String(OFFER_TIMER_DEFAULT_HOURS),
  autoRestart: false,
});

/** The saved timer as the form shows it. */
export const toOfferTimerInput = (timer: OfferTimerView): OfferTimerInput => ({
  enabled: timer.enabled,
  headline: timer.headline,
  endsAt: toIstInput(timer.endsAt),
  durationHours: String(timer.durationHours),
  autoRestart: timer.autoRestart,
});

/**
 * Checks the Offer timer form. Used in the browser and again by the Server Action, so messages
 * match. On a `reset` the end time is ignored: the countdown starts again from now.
 */
export const parseOfferTimerForm = (input: OfferTimerInput, { reset, now }: { reset: boolean; now: number }): OfferTimerParse => {
  const { errors: text } = offerTimerPage;
  const headline = String(input.headline ?? "").trim();
  const hoursText = String(input.durationHours ?? "").trim();
  const durationHours = /^\d{1,4}$/.test(hoursText) ? Number(hoursText) : NaN;
  const enabled = input.enabled === true;
  const autoRestart = input.autoRestart === true;
  const endsAt = reset ? null : istInputToDate(String(input.endsAt ?? "").trim());

  const errors: Partial<Record<OfferTimerField, string>> = {};
  if (!headline) errors.headline = text.headlineMissing;
  else if (headline.length > OFFER_HEADLINE_MAX) errors.headline = text.headlineLong;
  if (!(durationHours >= 1 && durationHours <= OFFER_TIMER_MAX_HOURS)) errors.durationHours = text.hours;
  if (!reset) {
    if (!endsAt) errors.endsAt = text.endsAt;
    // A past end time only makes sense when the countdown restarts by itself.
    else if (enabled && !autoRestart && endsAt.getTime() <= now) errors.endsAt = text.endsAtPast;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, change: { enabled, headline, endsAt, durationHours, autoRestart } };
};
