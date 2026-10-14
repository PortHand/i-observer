import "server-only";
import type { MailService } from "@/server/features/mail/service/mailService";
import { otpEmailTemplate } from "../template/otpEmailTemplate";
import type { OtpMessage, OtpSender } from "./otpSender";

/** Sends OTPs by email, with the shared mail service and design. */
export class EmailOtpSender implements OtpSender {
  readonly channel = "email" as const;
  private readonly mail: MailService;

  constructor(mail: MailService) {
    this.mail = mail;
  }

  async send({ target, code, expiresInMinutes }: OtpMessage): Promise<void> {
    await this.mail.sendTemplate(otpEmailTemplate, { code, expiresInMinutes }, { to: target });
  }
}
