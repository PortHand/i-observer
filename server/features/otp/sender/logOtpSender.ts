import "server-only";
import type { OtpChannel } from "../schema/otpSchema";
import type { OtpMessage, OtpSender } from "./otpSender";

/** Test stand-in for a channel's real sender: prints the OTP to the server log instead of sending it. */
export class LogOtpSender implements OtpSender {
  readonly channel: OtpChannel;

  constructor(channel: OtpChannel) {
    this.channel = channel;
  }

  async send({ target, code, expiresInMinutes }: OtpMessage): Promise<void> {
    console.info(`[otp] TO_TEST is on, so nothing was sent. ${this.channel} OTP for ${target}: ${code} (valid ${expiresInMinutes} min)`);
  }
}
