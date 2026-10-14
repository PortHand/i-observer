import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { TopicId } from "@/app/(view)/(pview)/contact/content/contactContent";

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Code such as T-AB12CD shown to the customer so they can quote it in follow-ups. */
  ticket: text("ticket").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  topic: text("topic").$type<TopicId>().notNull(),
  /** Order reference such as IOB-AB12CD, when the customer gave one. */
  reference: text("reference"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
