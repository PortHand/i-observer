import "server-only";
import { createHmac } from "node:crypto";
import { Database, type Tx } from "@/server/core/database";
import { env } from "@/server/core/env";
import { HttpError } from "@/server/core/httpError";
import type { SignInAttemptRepository } from "../repository/signInAttemptRepository";

const MINUTE = 60 * 1000;

/**
 * Limits on failed sign-ins, counted in the database so they hold across server instances. Both
 * apply to the website's sign-in form and the desktop app's /api/app/sign-in.
 */
export const signInLimits = {
  /** Failures one username may have in the window before it pauses. */
  maxPerUsername: 5,
  /** Failures one address may have in the window, across all usernames (guessing many accounts). */
  maxPerIp: 20,
  windowMinutes: 15,
  /** Rows older than this are deleted. Must be longer than the window. */
  keepHours: 24,
};

const messages = {
  // The same for every username, existing or not, so the lock doesn't reveal which accounts exist.
  locked: (minutes: number) =>
    `Too many sign-in attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
};

/** Keyed hash, so the table can't be reversed into usernames or addresses without SESSION_SECRET. */
const keyedHash = (kind: "username" | "ip", value: string) => {
  const secret = env.sessionSecret;
  if (!secret) throw new Error("SESSION_SECRET must be set to sign in. Add it to .env.development (see .env.example).");
  return createHmac("sha256", `${secret}:sign-in-attempts`).update(`${kind}:${value}`).digest("base64url");
};

export class SignInLimiter {
  private readonly attempts: SignInAttemptRepository;

  constructor(attempts: SignInAttemptRepository) {
    this.attempts = attempts;
  }

  /**
   * Runs `verify` unless the username or address is over its limit (a 429 with retryAfter), and
   * records the outcome: a failure is counted, a success clears the username's failures. Errors
   * from `verify` are passed on unchanged. `username` must already be normalized.
   */
  async guard<T>(username: string, ip: string, verify: () => Promise<T>): Promise<T> {
    const usernameHash = keyedHash("username", username);
    const ipHash = keyedHash("ip", ip);

    return Database.transaction(async (tx) => {
      await this.attempts.lockUsername(tx, usernameHash);
      await this.assertAllowed(tx, usernameHash, ipHash);

      let result: T;
      try {
        result = await verify();
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          await this.attempts.addFailure(tx, usernameHash, ipHash);
          await this.attempts.deleteOlderThan(tx, new Date(Date.now() - signInLimits.keepHours * 60 * MINUTE));
          // Commit the failure, then report it: throwing here would roll it back.
          return { failed: error } as const;
        }
        throw error;
      }
      await this.attempts.clearUsername(tx, usernameHash);
      return { result } as const;
    }).then((outcome) => {
      if ("failed" in outcome) throw outcome.failed;
      return outcome.result;
    });
  }

  private async assertAllowed(tx: Tx, usernameHash: string, ipHash: string): Promise<void> {
    const windowMs = signInLimits.windowMinutes * MINUTE;
    const since = new Date(Date.now() - windowMs);
    // One after another: both run on the transaction's single connection.
    const byUsername = await this.attempts.failuresForUsername(tx, usernameHash, since);
    const byIp = await this.attempts.failuresForIp(tx, ipHash, since);

    const blocked = [
      byUsername.count >= signInLimits.maxPerUsername ? byUsername.oldest : null,
      byIp.count >= signInLimits.maxPerIp ? byIp.oldest : null,
    ].filter((oldest): oldest is Date => oldest !== null);
    if (blocked.length === 0) return;

    // Open again once the oldest counted failure leaves the window.
    const reopensAt = Math.max(...blocked.map((oldest) => oldest.getTime() + windowMs));
    const retryAfter = Math.max(1, Math.ceil((reopensAt - Date.now()) / 1000));
    throw HttpError.tooManyRequests(messages.locked(Math.ceil(retryAfter / 60)), retryAfter);
  }
}
