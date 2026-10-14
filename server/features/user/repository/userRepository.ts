import "server-only";
import { eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { users } from "../schema/userSchema";

export type UserRow = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type UserChanges = Partial<Pick<NewUser, "phone" | "planId">>;

/** Postgres error code for a broken unique constraint. */
const UNIQUE_VIOLATION = "23505";

/** True when `error` (or its cause, as Drizzle wraps driver errors) is a unique-constraint violation. */
export const isUniqueViolation = (error: unknown): boolean => {
  const { code, cause } = (error ?? {}) as { code?: string; cause?: unknown };
  return code === UNIQUE_VIOLATION || (cause !== undefined && isUniqueViolation(cause));
};

export class UserRepository extends BaseRepository {
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

  async update(id: string, changes: UserChanges): Promise<UserRow> {
    const [row] = await this.db
      .update(users)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row;
  }
}
