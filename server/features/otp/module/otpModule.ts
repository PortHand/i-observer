// Wires the OTP feature together. Pages call it through the Server Actions in action/otpActions.ts;
// the order feature takes otpService in its constructor.

import "server-only";
import { env } from "@/server/core/env";
import { mailService } from "@/server/features/mail/module/mailModule";
import { OtpRepository } from "../repository/otpRepository";
import { EmailOtpSender } from "../sender/emailOtpSender";
import { LogOtpSender } from "../sender/logOtpSender";
import { OtpSenderFactory } from "../sender/otpSenderFactory";
import { OtpService } from "../service/otpService";

// TO_TEST=true in .env: OTPs are printed to the server log instead of being sent.
const testMode = env.toTest;
if (testMode && env.isProduction) {
  console.warn("[otp] TO_TEST is on in production: OTPs are logged, not emailed. Turn it off before going live.");
}

// One sender per channel. To add SMS: add "sms" to OtpChannel, write an SmsOtpSender, list it here.
const senders = new OtpSenderFactory([testMode ? new LogOtpSender("email") : new EmailOtpSender(mailService)]);

export const otpService = new OtpService(new OtpRepository(), senders);
