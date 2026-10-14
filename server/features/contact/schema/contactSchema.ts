import { isNotNull } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { TopicId } from "@/app/(view)/(pview)/contact/content/contactContent";

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Code such as T-AB12CD shown to the customer so they can quote it in follow-ups. Unique, so also indexed. */
    ticket: text("ticket").notNull().unique(),
    name: text("name").notNull(),
    /** Lower-cased by the form parser, so lookups can match exactly. */
    email: text("email").notNull(),
    phone: text("phone"),
    topic: text("topic").$type<TopicId>().notNull(),
    /** Order reference such as IOB-AB12CD, when the customer gave one. */
    reference: text("reference"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Everything one customer has sent.
    index("contact_messages_email_idx").on(table.email),
    // Messages about one order. Most messages have no reference, so those rows are left out.
    index("contact_messages_reference_idx").on(table.reference).where(isNotNull(table.reference)),
    // Inbox order, newest first.
    index("contact_messages_created_at_idx").on(table.createdAt.desc()),
  ],
);
