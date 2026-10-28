import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Plans and their prices are edited on the admin portal's Plans page; the UPI payee on its UPI
// accounts page. Prices and the UPI ID change without a redeploy.

export const plans = pgTable(
  "plans",
  {
    /** Short slug such as "yearly". Stored on orders, so don't rename one that has orders. */
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** Shown under the price, e.g. "12 months", "2 hours" or "One-time". Display only: see durationMonths. */
    period: text("period").notNull(),
    /**
     * Access one unit of the plan gives: calendar months, or hours for short passes. At most one is
     * set; both null means lifetime (never expires).
     */
    durationMonths: integer("duration_months"),
    durationHours: integer("duration_hours"),
    description: text("description").notNull(),
    /** Optional ribbon such as "Best value". */
    badge: text("badge"),
    /** Plans are listed in ascending order. */
    sortOrder: integer("sort_order").notNull().default(0),
    /** Pre-selected at checkout. At most one plan can be the default. */
    isDefault: boolean("is_default").notNull().default(false),
    /** Inactive plans are hidden and can't be ordered, but old orders keep pointing at them. */
    active: boolean("active").notNull().default(true),
    /** Sale window: outside it the plan is hidden and can't be ordered. Null means no limit on that side. */
    availableFrom: timestamp("available_from", { withTimezone: true }),
    availableUntil: timestamp("available_until", { withTimezone: true }),
    /** Most units of this plan one order may hold. Keep lifetime plans at 1. */
    maxQuantity: integer("max_quantity").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("plans_duration_positive", sql`${table.durationMonths} IS NULL OR ${table.durationMonths} > 0`),
    check("plans_duration_hours_positive", sql`${table.durationHours} IS NULL OR ${table.durationHours} > 0`),
    check("plans_one_duration_unit", sql`${table.durationMonths} IS NULL OR ${table.durationHours} IS NULL`),
    check("plans_max_quantity_positive", sql`${table.maxQuantity} > 0`),
    uniqueIndex("plans_one_default_idx").on(table.isDefault).where(sql`${table.isDefault}`),
  ],
);

/**
 * What each plan costs, and when. A plan's price is picked from the rows that have started and not
 * ended: a row with valid_to set (a sale) beats one without, then the latest valid_from wins.
 * - Change the price: set valid_to = now() on the current row and add a new one. Orders keep
 *   pointing at the exact price they were charged.
 * - Run a sale: add a row with both dates set. It wins while it runs; the normal price comes back after.
 * A plan with no row in force isn't shown and can't be ordered.
 */
export const planPrices = pgTable(
  "plan_prices",
  {
    id: serial("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    /** Whole paise (₹3,999 is 399900), so amounts never pick up floating-point rounding. 0: free. */
    amountPaise: integer("amount_paise").notNull(),
    /** The original price, shown struck through beside amountPaise with the % off. Null: no discount shown. */
    compareAtPaise: integer("compare_at_paise"),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull().defaultNow(),
    /** Null: no end date. */
    validTo: timestamp("valid_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // 0 is a free plan: claimed at checkout without a payment, once per email or phone.
    check("plan_prices_amount_not_negative", sql`${table.amountPaise} >= 0`),
    check("plan_prices_compare_at_above_amount", sql`${table.compareAtPaise} IS NULL OR ${table.compareAtPaise} > ${table.amountPaise}`),
    check("plan_prices_valid_range", sql`${table.validTo} IS NULL OR ${table.validTo} > ${table.validFrom}`),
    // A plan's current price.
    index("plan_prices_plan_id_valid_from_idx").on(table.planId, table.validFrom),
  ],
);

export const upiAccounts = pgTable(
  "upi_accounts",
  {
    id: serial("id").primaryKey(),
    /** Business UPI ID the checkout QR code pays, e.g. "ioverlay@okaxis". */
    upiId: text("upi_id").notNull(),
    /** Name shown in the customer's UPI app. */
    payeeName: text("payee_name").notNull(),
    /** New orders pay the active account. At most one account can be active. */
    active: boolean("active").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("upi_accounts_one_active_idx").on(table.active).where(sql`${table.active}`)],
);
