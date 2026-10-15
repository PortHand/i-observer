import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { FeedbackTopic } from "@/app/(view)/sview/profile/content/profileContent";
import { orders } from "@/server/features/order/schema/orderSchema";
import { users } from "@/server/features/user/schema/userSchema";

/** Notes signed-in customers send from their profile page, with a 1–5 rating. */
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    topic: text("topic").$type<FeedbackTopic>().notNull(),
    message: text("message").notNull(),
    /** One of the customer's own orders, when the feedback is about it. */
    orderReference: text("order_reference").references(() => orders.reference),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("feedback_rating_range", sql`${table.rating} BETWEEN 1 AND 5`),
    // One customer's feedback, newest first.
    index("feedback_user_id_created_at_idx").on(table.userId, table.createdAt),
  ],
);
