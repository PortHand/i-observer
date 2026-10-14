import "server-only";
import type { ContactMessage } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { randomCode, withUniqueCode } from "@/server/core/randomCode";
import type { ContactRepository } from "../repository/contactRepository";

export class ContactService {
  private readonly messages: ContactRepository;

  constructor(messages: ContactRepository) {
    this.messages = messages;
  }

  /** Stores the message and returns the ticket the customer quotes in follow-ups. */
  async send({ name, email, phone, topic, reference, message }: ContactMessage): Promise<string> {
    // TODO: also notify the support mailbox once an email service is set up.
    return withUniqueCode(
      () => `T-${randomCode(6)}`,
      (ticket) =>
        this.messages.create({ ticket, name, email, phone: phone || null, topic, reference: reference || null, message }),
    );
  }
}
