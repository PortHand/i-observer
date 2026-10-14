import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { plans } from "@/server/features/pricing/schema/pricingSchema";

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
  /** The plan from the customer's latest order. */
  planId: text("plan_id").references(() => plans.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
