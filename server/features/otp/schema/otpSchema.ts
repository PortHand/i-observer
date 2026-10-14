import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** How the code reaches the customer. Add "sms" or "whatsapp" here, and an OtpSender for it in otpModule. */
export type OtpChannel = "email";

/** Why the code was sent. A code or token for one purpose never works for another. */
export const otpPurposes = ["checkout"] as const;
export type OtpPurpose = (typeof otpPurposes)[number];

/** One-time passwords (OTPs) that prove a customer controls an email address (or, later, a phone number). */
export const otp = pgTable(
  "otp",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").$type<OtpChannel>().notNull(),
    /** Where the code went: a lower-cased email address, or later a phone number. */
    target: text("target").notNull(),
    purpose: text("purpose").$type<OtpPurpose>().notNull(),
    /** SHA-256 of the channel, target, purpose and code. The code itself is never stored. */
    codeHash: text("code_hash").notNull(),
    /** Wrong guesses so far. The code stops working after the limit in OtpService. */
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Set when the right code is entered. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    /** SHA-256 of the token handed back after a correct code; later requests prove the target with it. */
    tokenHash: text("token_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Latest code for a target, and the per-hour send limit.
    index("otp_target_created_at_idx").on(table.channel, table.target, table.purpose, table.createdAt.desc()),
  ],
);
