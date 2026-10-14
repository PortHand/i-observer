import "server-only";
import type { OtpChannel } from "../schema/otpSchema";
import type { OtpSender } from "./otpSender";

/** Picks the sender for a channel. Built in otpModule from every OtpSender the app has. */
export class OtpSenderFactory {
  private readonly senders: Map<OtpChannel, OtpSender>;

  constructor(senders: OtpSender[]) {
    this.senders = new Map(senders.map((sender) => [sender.channel, sender]));
  }

  get(channel: OtpChannel): OtpSender {
    const sender = this.senders.get(channel);
    if (!sender) throw new Error(`No OTP sender is registered for the "${channel}" channel.`);
    return sender;
  }
}
