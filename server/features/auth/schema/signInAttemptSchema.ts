import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Failed sign-ins, for the limits in SignInLimiter: too many for one username or from one address
 * and sign-in pauses for a while. A success clears that username's rows; rows older than a day are
 * deleted as new ones arrive. Usernames and addresses are stored as keyed hashes (HMAC with
 * SESSION_SECRET), never in the clear, so the table doesn't list who tried to sign in or from where.
 */
export const signInAttempts = pgTable(
  "sign_in_attempts",
  {
    id: serial("id").primaryKey(),
    usernameHash: text("username_hash").notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sign_in_attempts_username_created_at_idx").on(table.usernameHash, table.createdAt),
    index("sign_in_attempts_ip_created_at_idx").on(table.ipHash, table.createdAt),
    index("sign_in_attempts_created_at_idx").on(table.createdAt),
  ],
);
