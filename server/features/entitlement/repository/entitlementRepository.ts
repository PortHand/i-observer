import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import type { Tx } from "@/server/core/database";
import { users } from "@/server/features/user/schema/userSchema";
import { entitlements } from "../schema/entitlementSchema";

export type EntitlementRow = typeof entitlements.$inferSelect;
export type NewEntitlement = Omit<typeof entitlements.$inferInsert, "id" | "status" | "revokedAt" | "createdAt" | "updatedAt">;

// users.access_until and users.lifetime_access are written here too: they're a copy of this
// feature's rows, and only EntitlementService keeps them up to date.

export class EntitlementRepository extends BaseRepository {
  /**
   * Locks the customer's row until `tx` ends, so two changes to the same customer's access (e.g.
   * two payments verified at once) run one after the other and each sees the other's rows.
   */
  async lockUser(tx: Tx, userId: string): Promise<boolean> {
    const [row] = await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
    return Boolean(row);
  }

  async insert(tx: Tx, rows: NewEntitlement[]): Promise<void> {
    if (rows.length > 0) await tx.insert(entitlements).values(rows);
  }

  /** The customer's active rows in queue order: oldest grant first. */
  listActive(tx: Tx, userId: string): Promise<EntitlementRow[]> {
    return tx
      .select()
      .from(entitlements)
      .where(and(eq(entitlements.userId, userId), eq(entitlements.status, "active")))
      .orderBy(asc(entitlements.grantedAt), asc(entitlements.id));
  }

  async setDates(tx: Tx, id: number, startsAt: Date, endsAt: Date | null): Promise<void> {
    await tx.update(entitlements).set({ startsAt, endsAt, updatedAt: new Date() }).where(eq(entitlements.id, id));
  }

  /** Revokes the active rows granted for these order lines. */
  async revokeForOrderItems(tx: Tx, orderItemIds: number[]): Promise<void> {
    if (orderItemIds.length === 0) return;
    const now = new Date();
    await tx
      .update(entitlements)
      .set({ status: "revoked", revokedAt: now, updatedAt: now })
      .where(and(inArray(entitlements.orderItemId, orderItemIds), eq(entitlements.status, "active")));
  }

  async setUserAccess(tx: Tx, userId: string, accessUntil: Date | null, lifetimeAccess: boolean): Promise<void> {
    await tx.update(users).set({ accessUntil, lifetimeAccess, updatedAt: new Date() }).where(eq(users.id, userId));
  }
}
