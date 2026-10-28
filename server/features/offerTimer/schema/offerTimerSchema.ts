import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/server/features/user/schema/userSchema";

/** The one row's id: a single countdown covers the whole website. */
export const OFFER_TIMER_ID = "site";

/**
 * The "Offer ends in" countdown over the pricing cards and checkout, set by admins on the admin
 * portal's Offer timer page. Display only: it doesn't change any price. No row means no countdown.
 */
export const offerTimer = pgTable("offer_timer", {
  id: text("id").primaryKey(),
  /** When off, no countdown is shown anywhere. */
  enabled: boolean("enabled").notNull().default(false),
  /** Text before the countdown, e.g. "Launch offer ends in". */
  headline: text("headline").notNull(),
  /** When the countdown reaches zero. */
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  /** How long a reset (and each automatic restart) runs for. */
  durationHours: integer("duration_hours").notNull(),
  /** When on, the countdown starts again for durationHours each time it reaches zero; when off, it disappears. */
  autoRestart: boolean("auto_restart").notNull().default(false),
  /** The admin who last saved the timer. */
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
