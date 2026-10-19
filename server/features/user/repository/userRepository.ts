import "server-only";
import { and, eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { users } from "../schema/userSchema";

export type UserRow = typeof users.$inferSelect;

/** An account may hold one sign-in of each kind at a time: one browser and one desktop app. */
export type SessionKind = "web" | "app";

const sessionColumn = { web: "webSessionId", app: "appSessionId" } as const;
export type NewUser = Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">;

/** Postgres error code for a broken unique constraint. */
const UNIQUE_VIOLATION = "23505";

/** True when `error` (or its cause, as Drizzle wraps driver errors) is a unique-constraint violation. */
export const isUniqueViolation = (error: unknown): boolean => {
  const { code, cause } = (error ?? {}) as { code?: string; cause?: unknown };
  return code === UNIQUE_VIOLATION || (cause !== undefined && isUniqueViolation(cause));
};

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row ?? null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.username, username));
    return row ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email));
    return row ?? null;
  }

  async findByPhone(phone: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.phone, phone));
    return row ?? null;
  }

  async create(user: NewUser): Promise<UserRow> {
    const [row] = await this.db.insert(users).values(user).returning();
    return row;
  }

  /** Makes `sessionId` the account's one valid sign-in of that kind, ending the previous one. */
  async setSession(id: string, kind: SessionKind, sessionId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ [sessionColumn[kind]]: sessionId, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  /** Signs the account out of that kind, unless it has signed in again since `sessionId`. */
  async clearSession(id: string, kind: SessionKind, sessionId: string): Promise<void> {
    const column = sessionColumn[kind];
    await this.db
      .update(users)
      .set({ [column]: null, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users[column], sessionId)));
  }
}
