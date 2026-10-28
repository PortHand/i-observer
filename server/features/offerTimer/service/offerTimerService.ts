import "server-only";
import type { Offer } from "@/app/(view)/(pview)/get-ioverlay/services/getService";
import { offerDeadline } from "@/app/(view)/(pview)/home/helper/homeHelper";
import { OFFER_TIMER_DEFAULT_HOURS, offerTimerPage } from "@/app/(view)/sview/admin/content/adminContent";
import type { OfferTimerChange } from "@/app/(view)/sview/admin/helper/offerTimerHelper";
import type { OfferTimerView } from "@/app/(view)/sview/admin/services/adminService";
import type { OfferTimerRepository } from "../repository/offerTimerRepository";

const HOUR_MS = 60 * 60 * 1000;

/** The website's "Offer ends in" countdown, set from the admin portal and shown on the pricing pages. */
export class OfferTimerService {
  private readonly timers: OfferTimerRepository;

  constructor(timers: OfferTimerRepository) {
    this.timers = timers;
  }

  /** The saved timer, or a switched-off one when it was never saved. */
  async timer(): Promise<OfferTimerView> {
    const row = await this.timers.find();
    if (!row) {
      return {
        enabled: false,
        headline: offerTimerPage.defaultHeadline,
        endsAt: null,
        durationHours: OFFER_TIMER_DEFAULT_HOURS,
        autoRestart: false,
        nextEndsAt: null,
        updatedAt: null,
        updatedBy: null,
      };
    }
    const view = {
      enabled: row.enabled,
      headline: row.headline,
      endsAt: row.endsAt.toISOString(),
      durationHours: row.durationHours,
      autoRestart: row.autoRestart,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedByUsername,
    };
    const next = OfferTimerService.offer(view, Date.now());
    return { ...view, nextEndsAt: next?.endsAt ?? null };
  }

  /**
   * Saves the timer. `change` must have come from parseOfferTimerForm; its endsAt is null on a
   * reset, which starts the countdown again from now for durationHours.
   */
  save(change: OfferTimerChange, adminId: string): Promise<void> {
    const endsAt = change.endsAt ?? new Date(Date.now() + change.durationHours * HOUR_MS);
    return this.timers.save({
      enabled: change.enabled,
      headline: change.headline,
      endsAt,
      durationHours: change.durationHours,
      autoRestart: change.autoRestart,
      updatedBy: adminId,
    });
  }

  /** What the pricing pages show at `now`: null when the timer is off, or has run out and doesn't restart. */
  static offer(timer: Pick<OfferTimerView, "enabled" | "headline" | "endsAt" | "durationHours" | "autoRestart">, now: number): Offer | null {
    if (!timer.enabled || !timer.endsAt) return null;
    const restartHours = timer.autoRestart ? timer.durationHours : null;
    const deadline = offerDeadline(Date.parse(timer.endsAt), restartHours, now);
    if (deadline === null) return null;
    return { headline: timer.headline, endsAt: new Date(deadline).toISOString(), restartHours };
  }
}
