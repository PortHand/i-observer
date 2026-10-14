import "server-only";
import type { OtpChannel } from "../schema/otpSchema";

export interface OtpMessage {
  /** Where to send it: an email address for "email", a phone number for "sms". */
  target: string;
  code: string;
  expiresInMinutes: number;
}

/** Delivers OTPs over one channel. Implement one per channel and register it in otpModule. */
export interface OtpSender {
  readonly channel: OtpChannel;
  send(message: OtpMessage): Promise<void>;
}
