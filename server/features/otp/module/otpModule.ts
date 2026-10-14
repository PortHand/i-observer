// Wires the OTP feature together. Pages call it through the Server Actions in action/otpActions.ts;
// the order feature takes otpService in its constructor.

import "server-only";
import { mailService } from "@/server/features/mail/module/mailModule";
import { OtpRepository } from "../repository/otpRepository";
import { EmailOtpSender } from "../sender/emailOtpSender";
import { OtpSenderFactory } from "../sender/otpSenderFactory";
import { OtpService } from "../service/otpService";

// One sender per channel. To add SMS: add "sms" to OtpChannel, write an SmsOtpSender, list it here.
const senders = new OtpSenderFactory([new EmailOtpSender(mailService)]);

export const otpService = new OtpService(new OtpRepository(), senders);
