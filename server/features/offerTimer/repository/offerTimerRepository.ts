import "server-only";
import { eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { users } from "@/server/features/user/schema/userSchema";
import { OFFER_TIMER_ID, offerTimer } from "../schema/offerTimerSchema";

export type OfferTimerRow = typeof offerTimer.$inferSelect & { updatedByUsername: string | null };
export type OfferTimerChange = Pick<typeof offerTimer.$inferInsert, "enabled" | "headline" | "endsAt" | "durationHours" | "autoRestart" | "updatedBy">;

export class OfferTimerRepository extends BaseRepository {
  /** The timer with the username of the admin who saved it, or undefined when it was never saved. */
  async find(): Promise<OfferTimerRow | undefined> {
    const [row] = await this.db
      .select({ timer: offerTimer, updatedByUsername: users.username })
      .from(offerTimer)
      .leftJoin(users, eq(users.id, offerTimer.updatedBy))
      .where(eq(offerTimer.id, OFFER_TIMER_ID));
    return row && { ...row.timer, updatedByUsername: row.updatedByUsername };
  }

  async save(change: OfferTimerChange): Promise<void> {
    const values = { ...change, updatedAt: new Date() };
    await this.db
      .insert(offerTimer)
      .values({ id: OFFER_TIMER_ID, ...values })
      .onConflictDoUpdate({ target: offerTimer.id, set: values });
  }
}
