import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { sessions, users } from "../schema/authSchema";

export class SessionRepository extends BaseRepository {
  async create(id: string, userId: string, expiresAt: Date): Promise<void> {
    await this.db.insert(sessions).values({ id, userId, expiresAt });
  }

  /** The user a session belongs to, or null if the session doesn't exist or has expired. */
  async findUser(id: string) {
    const [row] = await this.db
      .select({ username: users.username, email: users.email })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }
}
