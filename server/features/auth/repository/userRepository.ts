import "server-only";
import { eq, or } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { users } from "../schema/authSchema";

export type UserRecord = typeof users.$inferSelect;

export class UserRepository extends BaseRepository {
  /** Finds a user by username or email; both are stored lower-cased. */
  async findByLogin(login: string): Promise<UserRecord | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(or(eq(users.username, login), eq(users.email, login)))
      .limit(1);
    return row ?? null;
  }

  async create(user: Pick<UserRecord, "username" | "email" | "passwordHash">): Promise<UserRecord> {
    const [row] = await this.db.insert(users).values(user).returning();
    return row;
  }
}
