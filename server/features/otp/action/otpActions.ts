"use server";

// Server Actions for one-time passwords (no app/api route). Email is the only channel so far.

import { isValidEmail } from "@/app/(view)/(pview)/home/helper/homeHelper";
import { assertValid, runAction } from "@/server/core/baseAction";
import { HttpError } from "@/server/core/httpError";
import { otpService } from "../module/otpModule";
import type { OtpKey } from "../repository/otpRepository";
import { otpPurposes, type OtpPurpose } from "../schema/otpSchema";
import { otpLimits } from "../service/otpService";

/** Arguments come straight from the browser, so check both before using them. */
const emailKey = (email: unknown, purpose: unknown): OtpKey => {
  if (!otpPurposes.includes(purpose as OtpPurpose)) throw HttpError.badRequest("Unknown verification purpose.");
  const target = String(email ?? "").trim().toLowerCase();
  assertValid(isValidEmail(target) ? {} : { email: "Enter a valid email address." });
  return { channel: "email", target, purpose: purpose as OtpPurpose };
};

/** Emails a 6-digit OTP to `email` for `purpose`, e.g. "checkout". */
export async function sendEmailOtp(email: string, purpose: OtpPurpose) {
  return runAction(async () => otpService.sendCode(emailKey(email, purpose)));
}

/** Checks the OTP. On success returns a token that proves the email to later actions, such as createOrder. */
export async function verifyEmailOtp(email: string, purpose: OtpPurpose, code: string) {
  return runAction(async () => {
    const key = emailKey(email, purpose);
    const digits = String(code ?? "").replace(/\D/g, "");
    if (digits.length !== otpLimits.codeLength) {
      assertValid({ code: `Enter the ${otpLimits.codeLength}-digit code from the email.` });
    }
    return { token: await otpService.verifyCode(key, digits) };
  });
}
