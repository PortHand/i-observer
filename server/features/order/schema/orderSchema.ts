import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { plans } from "@/server/features/pricing/schema/pricingSchema";

export type OrderStatus = "pending" | "submitted";

export const orders = pgTable(
  "orders",
  {
    /** Code such as IOV-AB12CD, added to the UPI payment note so the payment can be matched to the order. */
    reference: text("reference").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    // Copied from the plan and the active UPI account when the order is created or edited, so later
    // price or UPI changes don't alter what this customer was asked to pay, or where.
    amountPaise: integer("amount_paise").notNull(),
    upiId: text("upi_id").notNull(),
    payeeName: text("payee_name").notNull(),
    /** Lower-cased, so lookups can match exactly. */
    email: text("email").notNull(),
    /** 10-digit Indian mobile number without the country code. */
    phone: text("phone").notNull(),
    /** pending: QR code shown. submitted: the customer sent a UTR, so the payment needs checking. */
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    /** 12-digit UPI transaction reference the customer sent. */
    utr: text("utr"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    // Everything one customer has ordered.
    index("orders_email_idx").on(table.email),
    // Payments to check, oldest first.
    index("orders_status_created_at_idx").on(table.status, table.createdAt),
    // Matching a bank statement line to its order.
    index("orders_utr_idx").on(table.utr),
  ],
);
