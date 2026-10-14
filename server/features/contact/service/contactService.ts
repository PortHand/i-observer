import "server-only";
import type { ContactMessage } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { randomCode, withUniqueCode } from "@/server/core/randomCode";
import type { MailService } from "@/server/features/mail/service/mailService";
import type { ContactRepository } from "../repository/contactRepository";
import { contactAcknowledgementTemplate } from "../template/contactAcknowledgementTemplate";
import { contactNotificationTemplate } from "../template/contactNotificationTemplate";

export class ContactService {
  private readonly messages: ContactRepository;
  private readonly mail: MailService;

  constructor(messages: ContactRepository, mail: MailService) {
    this.messages = messages;
    this.mail = mail;
  }

  /** Stores the message, emails support and the customer, and returns the ticket the customer quotes in follow-ups. */
  async send(message: ContactMessage): Promise<string> {
    const { name, email, phone, topic, reference } = message;
    const ticket = await withUniqueCode(
      () => `T-${randomCode(6)}`,
      (code) =>
        this.messages.create({
          ticket: code,
          name,
          email,
          phone: phone || null,
          topic,
          reference: reference || null,
          message: message.message,
        }),
    );
    await this.notify(ticket, message);
    return ticket;
  }

  /**
   * The message is already saved, so a failed email is logged rather than shown to the customer:
   * they still get their ticket, and support can find the message in the database.
   */
  private async notify(ticket: string, message: ContactMessage) {
    const data = { ticket, message, receivedAt: new Date() };
    const results = await Promise.allSettled([
      this.mail.sendTemplate(contactNotificationTemplate, data, { to: this.mail.supportInbox, replyTo: message.email }),
      this.mail.sendTemplate(contactAcknowledgementTemplate, data, { to: message.email }),
    ]);
    for (const result of results) {
      if (result.status === "rejected") console.error(`[contact] ${ticket}:`, result.reason);
    }
  }
}
