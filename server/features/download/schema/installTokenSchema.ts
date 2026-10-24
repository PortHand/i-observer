import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/server/features/user/schema/userSchema";

/**
 * One-time tokens inside the Terminal install commands on the welcome page. The install script
 * sends its token back once to get a download link (InstallService.redeem); after that, or after
 * INSTALL_TOKEN_SECONDS, it no longer works. Making a new command deletes the account's unused ones.
 */
export const installTokens = pgTable(
  "install_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the token. The token itself is only ever shown to its account, never stored. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Set when an install script used it. */
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("install_tokens_user_id_idx").on(table.userId), index("install_tokens_expires_at_idx").on(table.expiresAt)],
);
