import "server-only";
import { Database, type Tx } from "@/server/core/database";
import type { OrderItemRow } from "@/server/features/order/repository/orderRepository";
import type { EntitlementRepository } from "../repository/entitlementRepository";

/** India has no daylight saving, so a fixed offset turns UTC into Indian dates. */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * `date` plus calendar months as customers in India count them: 15 Oct → 15 Jan, and a day the
 * target month doesn't have falls back to its last day (31 Jan + 1 month → 28 or 29 Feb).
 */
export const addMonths = (date: Date, months: number): Date => {
  const local = new Date(date.getTime() + IST_OFFSET_MS);
  const day = local.getUTCDate();
  local.setUTCDate(1);
  local.setUTCMonth(local.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 0)).getUTCDate();
  local.setUTCDate(Math.min(day, lastDay));
  return new Date(local.getTime() - IST_OFFSET_MS);
};

const HOUR_MS = 60 * 60 * 1000;

/** When a row's time ends if it starts at `startsAt`: its months or its hours. Callers skip lifetime rows. */
const endOf = (startsAt: Date, { durationMonths, durationHours }: { durationMonths: number | null; durationHours: number | null }) =>
  durationMonths !== null ? addMonths(startsAt, durationMonths) : new Date(startsAt.getTime() + (durationHours ?? 0) * HOUR_MS);

/** Lifetime: neither months nor hours. */
const isLifetime = (row: { durationMonths: number | null; durationHours: number | null }) =>
  row.durationMonths === null && row.durationHours === null;

/** Whether a customer can use the app at `now`, from the columns EntitlementService keeps on users. */
export const hasAccess = (user: { accessUntil: Date | null; lifetimeAccess: boolean }, now = new Date()) =>
  user.lifetimeAccess || (user.accessUntil !== null && user.accessUntil > now);

const missingUser = (userId: string) => new Error(`No user ${userId}: can't change their access.`);

export class EntitlementService {
  private readonly entitlements: EntitlementRepository;

  constructor(entitlements: EntitlementRepository) {
    this.entitlements = entitlements;
  }

  /**
   * Gives the customer the time bought on these order lines, inside the caller's transaction (the
   * one that marks the order verified). Each line's time queues after the customer's current time.
   */
  async grant(tx: Tx, userId: string, items: OrderItemRow[], grantedAt = new Date()): Promise<void> {
    if (!(await this.entitlements.lockUser(tx, userId))) throw missingUser(userId);
    await this.entitlements.insert(
      tx,
      items.map((item) => {
        // Quantity buys that many units back to back: 2 × 1 month is 2 months, 3 × 2 hours is 6 hours.
        const duration = {
          durationMonths: item.durationMonths === null ? null : item.durationMonths * item.quantity,
          durationHours: item.durationHours === null ? null : item.durationHours * item.quantity,
        };
        return {
          userId,
          orderItemId: item.id,
          planId: item.planId,
          ...duration,
          grantedAt,
          // Placeholders: refresh() below works out the real dates.
          startsAt: grantedAt,
          endsAt: isLifetime(duration) ? null : endOf(grantedAt, duration),
        };
      }),
    );
    await this.refresh(tx, userId);
  }

  /** Takes back the time granted for these order lines (e.g. a refund); later purchases move earlier to close the gap. */
  async revoke(tx: Tx, userId: string, orderItemIds: number[]): Promise<void> {
    if (!(await this.entitlements.lockUser(tx, userId))) throw missingUser(userId);
    await this.entitlements.revokeForOrderItems(tx, orderItemIds);
    await this.refresh(tx, userId);
  }

  /**
   * Works out the customer's dates again from their active rows and fixes users.access_until. Safe
   * to run any time, e.g. after editing entitlements by hand in `npm run db:studio`.
   */
  async refreshAccess(userId: string): Promise<void> {
    await Database.transaction(async (tx) => {
      if (!(await this.entitlements.lockUser(tx, userId))) throw missingUser(userId);
      await this.refresh(tx, userId);
    });
  }

  /**
   * The queue: each time row starts when it was granted or when the previous one ends, whichever
   * is later, and runs for its months or hours. Lifetime rows sit outside the queue. Expects the user locked.
   */
  private async refresh(tx: Tx, userId: string): Promise<void> {
    let accessUntil: Date | null = null;
    let lifetimeAccess = false;
    for (const row of await this.entitlements.listActive(tx, userId)) {
      let startsAt = row.grantedAt;
      let endsAt: Date | null = null;
      if (isLifetime(row)) {
        lifetimeAccess = true;
      } else {
        if (accessUntil && accessUntil > startsAt) startsAt = accessUntil;
        endsAt = endOf(startsAt, row);
        accessUntil = endsAt;
      }
      if (row.startsAt.getTime() !== startsAt.getTime() || row.endsAt?.getTime() !== endsAt?.getTime()) {
        await this.entitlements.setDates(tx, row.id, startsAt, endsAt);
      }
    }
    await this.entitlements.setUserAccess(tx, userId, accessUntil, lifetimeAccess);
  }
}
