import "server-only";
import { and, count, eq, gt, lt, min, sql, type SQL } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import type { Tx } from "@/server/core/database";
import { signInAttempts } from "../schema/signInAttemptSchema";

/** Failures counted in a window, and when the oldest of them happened. */
export interface FailureCount {
  count: number;
  oldest: Date | null;
}

export class SignInAttemptRepository extends BaseRepository {
  /**
   * Holds a lock on this username until `tx` ends, so parallel sign-ins for one account are counted
   * one after another and can't all slip in under the limit at once.
   */
  async lockUsername(tx: Tx, usernameHash: string): Promise<void> {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`sign-in:${usernameHash}`}))`);
  }

  async failuresForUsername(tx: Tx, usernameHash: string, since: Date): Promise<FailureCount> {
    return this.failures(tx, and(eq(signInAttempts.usernameHash, usernameHash), gt(signInAttempts.createdAt, since)));
  }

  async failuresForIp(tx: Tx, ipHash: string, since: Date): Promise<FailureCount> {
    return this.failures(tx, and(eq(signInAttempts.ipHash, ipHash), gt(signInAttempts.createdAt, since)));
  }

  async addFailure(tx: Tx, usernameHash: string, ipHash: string): Promise<void> {
    await tx.insert(signInAttempts).values({ usernameHash, ipHash });
  }

  /** After a successful sign-in: the account's earlier failures no longer count. */
  async clearUsername(tx: Tx, usernameHash: string): Promise<void> {
    await tx.delete(signInAttempts).where(eq(signInAttempts.usernameHash, usernameHash));
  }

  /** Rows older than every limit window are never read again. */
  async deleteOlderThan(tx: Tx, before: Date): Promise<void> {
    await tx.delete(signInAttempts).where(lt(signInAttempts.createdAt, before));
  }

  private async failures(tx: Tx, where: SQL | undefined): Promise<FailureCount> {
    const [row] = await tx
      .select({ count: count(), oldest: min(signInAttempts.createdAt) })
      .from(signInAttempts)
      .where(where);
    return { count: Number(row?.count ?? 0), oldest: row?.oldest ? new Date(row.oldest) : null };
  }
}
