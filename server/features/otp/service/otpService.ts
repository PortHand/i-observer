import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { VERIFICATION_REQUIRED } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { HttpError } from "@/server/core/httpError";
import type { OtpKey, OtpRepository } from "../repository/otpRepository";
import type { OtpChannel } from "../schema/otpSchema";
import type { OtpSenderFactory } from "../sender/otpSenderFactory";

const MINUTE = 60 * 1000;

/** Limits for codes. codeTtlMinutes is also shown to the customer. */
export const otpLimits = {
  codeLength: 6,
  codeTtlMinutes: 10,
  maxAttempts: 5,
  resendAfterSeconds: 60,
  maxCodesPerHour: 5,
  /** How long a verified target may be used, e.g. to place or edit an order. */
  tokenTtlMinutes: 60,
};

/** Words for each channel in customer-facing messages. */
const channelNoun: Record<OtpChannel, string> = { email: "email" };

const messages = {
  wait: (seconds: number) => `Please wait ${seconds} seconds before asking for another code.`,
  tooMany: (channel: OtpChannel) => `Too many codes requested for this ${channelNoun[channel]}. Try again in an hour.`,
  noCode: "That code has expired. Ask for a new one.",
  locked: "Too many wrong tries. Ask for a new code.",
  wrong: (left: number) => `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`,
  unverified: (channel: OtpChannel) => `Verify your ${channelNoun[channel]} with the code we sent before continuing.`,
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
// Scoped to channel, target and purpose, so a code can't be replayed anywhere else.
const hashCode = ({ channel, target, purpose }: OtpKey, code: string) => sha256(`${channel}:${target}:${purpose}:${code}`);

const sameHash = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export interface CodeSent {
  /** Seconds until the customer may ask for another code. */
  resendAfter: number;
  /** Minutes the code stays valid. */
  expiresInMinutes: number;
}

/**
 * Proves a customer controls an email address (and, later, other channels such as SMS) with a
 * one-time code sent to it. `key.target` must already be normalized, e.g. a lower-cased email.
 */
export class OtpService {
  private readonly otps: OtpRepository;
  private readonly senders: OtpSenderFactory;

  constructor(otps: OtpRepository, senders: OtpSenderFactory) {
    this.otps = otps;
    this.senders = senders;
  }

  /** Sends a new code for `key`. */
  async sendCode(key: OtpKey): Promise<CodeSent> {
    const { resendAfterSeconds, maxCodesPerHour, codeLength, codeTtlMinutes } = otpLimits;
    const now = Date.now();

    const latest = await this.otps.latest(key);
    const waited = latest ? (now - latest.createdAt.getTime()) / 1000 : Infinity;
    if (waited < resendAfterSeconds) {
      // The last code is still valid (it was sent under a minute ago), so the page can just ask for it.
      const retryAfter = Math.ceil(resendAfterSeconds - waited);
      throw HttpError.tooManyRequests(messages.wait(retryAfter), retryAfter);
    }
    if ((await this.otps.countSince(key, new Date(now - 60 * MINUTE))) >= maxCodesPerHour) {
      throw HttpError.tooManyRequests(messages.tooMany(key.channel));
    }

    const code = String(randomInt(0, 10 ** codeLength)).padStart(codeLength, "0");
    const id = await this.otps.create({ ...key, codeHash: hashCode(key, code), expiresAt: new Date(now + codeTtlMinutes * MINUTE) });
    try {
      await this.senders.get(key.channel).send({ target: key.target, code, expiresInMinutes: codeTtlMinutes });
    } catch (error) {
      await this.otps.delete(id);
      throw error;
    }
    return { resendAfter: resendAfterSeconds, expiresInMinutes: codeTtlMinutes };
  }

  /** Checks the latest code for `key`. Returns a token that proves the target in later requests. */
  async verifyCode(key: OtpKey, code: string): Promise<string> {
    const latest = await this.otps.latest(key);
    const fail = (message: string) => HttpError.badRequest(message, { code: message });
    if (!latest || latest.verifiedAt || latest.expiresAt.getTime() < Date.now()) throw fail(messages.noCode);
    if (latest.attempts >= otpLimits.maxAttempts) throw fail(messages.locked);

    if (!sameHash(hashCode(key, code), latest.codeHash)) {
      await this.otps.addAttempt(latest.id);
      const left = otpLimits.maxAttempts - latest.attempts - 1;
      throw fail(left > 0 ? messages.wrong(left) : messages.locked);
    }

    const token = randomBytes(32).toString("base64url");
    if (!(await this.otps.markVerified(latest.id, sha256(token)))) throw fail(messages.noCode);
    return token;
  }

  /** Throws unless `token` came from verifying `key` within the last hour. */
  async assertVerified(key: OtpKey, token: string | null | undefined): Promise<void> {
    const since = new Date(Date.now() - otpLimits.tokenTtlMinutes * MINUTE);
    const row = token ? await this.otps.findByToken(key, sha256(token), since) : null;
    if (!row) {
      const message = messages.unverified(key.channel);
      throw new HttpError(400, message, { [key.channel]: message }, { code: VERIFICATION_REQUIRED });
    }
  }
}
