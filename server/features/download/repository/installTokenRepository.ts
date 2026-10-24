import "server-only";
import { and, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { installTokens } from "../schema/installTokenSchema";

export class InstallTokenRepository extends BaseRepository {
  /**
   * Saves a new token for the account and deletes its unused ones, so only the latest command shown
   * works. Expired and used rows of every account go too: nothing reads them again.
   */
  async replace(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(installTokens)
        .where(
          or(
            and(eq(installTokens.userId, userId), isNull(installTokens.usedAt)),
            lt(installTokens.expiresAt, new Date()),
            isNotNull(installTokens.usedAt),
          ),
        );
      await tx.insert(installTokens).values({ userId, tokenHash, expiresAt });
    });
  }

  /**
   * Marks the token used and returns its account, or null when it's unknown, expired or used. One
   * statement, so two scripts sending the same token can't both get a link.
   */
  async redeem(tokenHash: string): Promise<string | null> {
    const now = new Date();
    const [row] = await this.db
      .update(installTokens)
      .set({ usedAt: now })
      .where(and(eq(installTokens.tokenHash, tokenHash), isNull(installTokens.usedAt), gt(installTokens.expiresAt, now)))
      .returning({ userId: installTokens.userId });
    return row?.userId ?? null;
  }
}
