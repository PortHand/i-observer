import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Plans and the UPI payee are edited in the database (for now with `npm run db:studio`), so prices
// and the UPI ID change without a redeploy. Pages pick up edits within a minute.

export const plans = pgTable(
  "plans",
  {
    /** Short slug such as "yearly". Stored on orders, so don't rename one that has orders. */
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** Whole paise (₹3,999 is 399900), so amounts never pick up floating-point rounding. */
    amountPaise: integer("amount_paise").notNull(),
    /** Shown under the price, e.g. "12 months" or "One-time". */
    period: text("period").notNull(),
    description: text("description").notNull(),
    /** Optional ribbon such as "Best value". */
    badge: text("badge"),
    /** Plans are listed in ascending order. */
    sortOrder: integer("sort_order").notNull().default(0),
    /** Pre-selected at checkout. At most one plan can be the default. */
    isDefault: boolean("is_default").notNull().default(false),
    /** Inactive plans are hidden and can't be ordered, but old orders keep pointing at them. */
    active: boolean("active").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("plans_amount_positive", sql`${table.amountPaise} > 0`),
    uniqueIndex("plans_one_default_idx").on(table.isDefault).where(sql`${table.isDefault}`),
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
