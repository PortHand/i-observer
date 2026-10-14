import { customType, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { PlanId } from "@/app/(view)/(pview)/get-iobserver/content/getContent";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

export const orderStatus = pgEnum("order_status", ["awaiting_payment", "payment_submitted", "paid", "cancelled"]);

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Code such as IOB-AB12CD that the customer adds to the UPI payment note. */
    reference: text("reference").notNull().unique(),
    planId: text("plan_id").$type<PlanId>().notNull(),
    /** Whole rupees, copied from the plan when the order is created so later price changes don't affect it. */
    amount: integer("amount").notNull(),
    email: text("email").notNull(),
    /** 10-digit Indian mobile number without the country code. */
    phone: text("phone").notNull(),
    status: orderStatus("status").notNull().default("awaiting_payment"),
    /** UPI transaction reference. Unique, so one payment can't be claimed for two orders. */
    utr: text("utr").unique(),
    screenshot: bytea("screenshot"),
    screenshotName: text("screenshot_name"),
    screenshotType: text("screenshot_type"),
    paymentSubmittedAt: timestamp("payment_submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("orders_email_idx").on(table.email), index("orders_status_idx").on(table.status)],
);
