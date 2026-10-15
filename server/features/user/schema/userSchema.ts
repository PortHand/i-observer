import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Customers. Created at checkout once the email is verified with an OTP; one account per email and
 * per phone number.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Lower-cased and verified by OTP. Unique, so also indexed. */
  email: text("email").notNull().unique(),
  /** 10-digit Indian mobile number without the country code. Unique, so also indexed. */
  phone: text("phone").notNull().unique(),
  /** Login name for the app: the email itself. */
  username: text("username").notNull().unique(),
  /**
   * Login password for the app, stored as plain text (not hashed) so it can be emailed to the
   * customer. Anyone who can read this table can read every password: keep database access tight.
   */
  password: text("password").notNull(),
  /**
   * End of the customer's paid time: the latest ends_at of their active entitlements, kept up to
   * date by EntitlementService. They have access while it's in the future, or lifetimeAccess is set.
   * Null: no time plan was ever verified.
   */
  accessUntil: timestamp("access_until", { withTimezone: true }),
  /** An active lifetime entitlement exists. */
  lifetimeAccess: boolean("lifetime_access").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
