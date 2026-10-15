import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orderItems } from "@/server/features/order/schema/orderSchema";
import { plans } from "@/server/features/pricing/schema/pricingSchema";
import { users } from "@/server/features/user/schema/userSchema";

/** active: counts towards the customer's access. revoked: taken back, e.g. after a refund. */
export type EntitlementStatus = "active" | "revoked";

/**
 * Access a customer was given, one row per verified order line. Time plans queue up: each starts
 * when the customer's earlier time runs out (or when it was granted, if that's later), so buying
 * again before expiry never loses days. EntitlementService works the dates out again whenever a
 * row is added or revoked, and copies the result to users.access_until.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    orderItemId: integer("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    /** Months this row adds (the line's duration × quantity). Null means lifetime. */
    durationMonths: integer("duration_months"),
    /** When the payment was verified. Rows queue up in this order. */
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    /** Null for lifetime. */
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: text("status").$type<EntitlementStatus>().notNull().default("active"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("entitlements_duration_positive", sql`${table.durationMonths} IS NULL OR ${table.durationMonths} > 0`),
    // One customer's access, in queue order.
    index("entitlements_user_id_granted_at_idx").on(table.userId, table.grantedAt),
    index("entitlements_order_item_id_idx").on(table.orderItemId),
  ],
);
