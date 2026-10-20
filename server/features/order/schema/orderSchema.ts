import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { planPrices, plans } from "@/server/features/pricing/schema/pricingSchema";
import { users } from "@/server/features/user/schema/userSchema";

/**
 * pending: QR code shown. submitted: the customer sent a UTR. verified: the payment was found, so
 * the plans' time was granted (see entitlements). rejected: no matching payment. refunded: the
 * money went back and the granted time was taken away.
 */
export type OrderStatus = "pending" | "submitted" | "verified" | "rejected" | "refunded";

export const orders = pgTable(
  "orders",
  {
    /** Code such as IOV-AB12CD, added to the UPI payment note so the payment can be matched to the order. */
    reference: text("reference").primaryKey(),
    // Copied from the active UPI account when the order is created or edited, with the total of the
    // order's lines, so later price or UPI changes don't alter what this customer was asked to pay, or where.
    /** Total of the order's lines (order_items.line_paise), in paise. */
    amountPaise: integer("amount_paise").notNull(),
    upiId: text("upi_id").notNull(),
    payeeName: text("payee_name").notNull(),
    /** The customer's account, created at checkout once the email is verified. Null on older orders. */
    userId: uuid("user_id").references(() => users.id),
    /** Lower-cased, so lookups can match exactly. */
    email: text("email").notNull(),
    /** 10-digit Indian mobile number without the country code. */
    phone: text("phone").notNull(),
    /** See OrderStatus. */
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    /** 12-digit UPI transaction reference the customer sent. */
    utr: text("utr"),
    /**
     * The payment screenshot the customer sent with the UTR, as its path in the private receipts
     * bucket (client/<email>/<utr>_<date>.png). Null when none was attached. Shown to admins through
     * a short-lived signed link, never a public one.
     */
    receiptPath: text("receipt_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    /** When the payment was last verified, rejected or refunded, and why (shown to no one but us). */
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
  },
  (table) => [
    // Everything one customer has ordered.
    index("orders_email_idx").on(table.email),
    // Everything one account has ordered.
    index("orders_user_id_idx").on(table.userId),
    // Payments to check, oldest first.
    index("orders_status_created_at_idx").on(table.status, table.createdAt),
    // Matching a bank statement line to its order.
    index("orders_utr_idx").on(table.utr),
  ],
);

/**
 * The plans in an order, one line per plan. Price and duration are copied in when the order is
 * saved, so editing the plan or its price later doesn't change what this order costs or grants.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderReference: text("order_reference")
      .notNull()
      .references(() => orders.reference, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    /** The price row charged. Null only on lines moved over from orders saved before plan_prices existed. */
    planPriceId: integer("plan_price_id").references(() => planPrices.id),
    quantity: integer("quantity").notNull().default(1),
    unitPaise: integer("unit_paise").notNull(),
    /** unitPaise × quantity. */
    linePaise: integer("line_paise").notNull(),
    /** One unit's access in months or hours, copied from the plan. Both null means lifetime. */
    durationMonths: integer("duration_months"),
    durationHours: integer("duration_hours"),
  },
  (table) => [
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    // One line per plan: a second unit raises the quantity.
    uniqueIndex("order_items_order_plan_idx").on(table.orderReference, table.planId),
  ],
);
