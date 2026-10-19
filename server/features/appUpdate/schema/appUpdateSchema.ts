import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/server/features/user/schema/userSchema";

/** The one row's id: a single policy covers the desktop app on every system. */
export const APP_UPDATE_POLICY_ID = "desktop";

/**
 * Whether the desktop app must be updated before it can be used, set by admins on the admin
 * portal's App update page. The app asks through GET /api/app/update on launch and while in use.
 * No row means no forced update.
 */
export const appUpdatePolicy = pgTable("app_update_policy", {
  id: text("id").primaryKey(),
  /** When on, apps older than minimumVersion are blocked until the user installs an update. */
  forceUpdate: boolean("force_update").notNull().default(false),
  /** Oldest version allowed while forceUpdate is on, e.g. "1.2.0". */
  minimumVersion: text("minimum_version").notNull(),
  /** Shown to users on the app's update screen; a default text when null. */
  message: text("message"),
  /** The admin who last saved the policy. */
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
