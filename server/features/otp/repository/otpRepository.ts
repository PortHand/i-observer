import "server-only";
import { and, count, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { otp, type OtpChannel, type OtpPurpose } from "../schema/otpSchema";

export type OtpRow = typeof otp.$inferSelect;
export type NewOtp = Pick<typeof otp.$inferInsert, "codeHash" | "expiresAt"> & OtpKey;

/** Who a code is for and why: every lookup is scoped to all three. */
export interface OtpKey {
  channel: OtpChannel;
  target: string;
  purpose: OtpPurpose;
}

const matches = ({ channel, target, purpose }: OtpKey) =>
  and(eq(otp.channel, channel), eq(otp.target, target), eq(otp.purpose, purpose));

export class OtpRepository extends BaseRepository {
  /** Returns the new row's id. */
  async create(row: NewOtp): Promise<string> {
    const [created] = await this.db.insert(otp).values(row).returning({ id: otp.id });
    return created.id;
  }

  /** The most recent code sent for `key`, used or not. */
  async latest(key: OtpKey): Promise<OtpRow | null> {
    const [row] = await this.db
      .select()
      .from(otp)
      .where(matches(key))
      .orderBy(desc(otp.createdAt))
      .limit(1);
    return row ?? null;
  }

  /** How many codes were sent for `key` after `since`. */
  async countSince(key: OtpKey, since: Date): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(otp)
      .where(and(matches(key), gt(otp.createdAt, since)));
    return row?.value ?? 0;
  }

  async addAttempt(id: string): Promise<void> {
    await this.db
      .update(otp)
      .set({ attempts: sql`${otp.attempts} + 1` })
      .where(eq(otp.id, id));
  }

  /** Marks the code used and stores the token's hash. Returns false if it was already used. */
  async markVerified(id: string, tokenHash: string): Promise<boolean> {
    const rows = await this.db
      .update(otp)
      .set({ verifiedAt: new Date(), tokenHash })
      .where(and(eq(otp.id, id), isNull(otp.verifiedAt)))
      .returning({ id: otp.id });
    return rows.length > 0;
  }

  /** An OTP for `key` whose token matches that was confirmed after `since`. */
  async findByToken(key: OtpKey, tokenHash: string, since: Date): Promise<OtpRow | null> {
    const [row] = await this.db
      .select()
      .from(otp)
      .where(
        and(
          matches(key),
          eq(otp.tokenHash, tokenHash),
          isNotNull(otp.verifiedAt),
          gt(otp.verifiedAt, since),
        ),
      );
    return row ?? null;
  }

  /** Deletes a code that never reached the customer, so it doesn't count against the send limits. */
  async delete(id: string): Promise<void> {
    await this.db.delete(otp).where(eq(otp.id, id));
  }
}
