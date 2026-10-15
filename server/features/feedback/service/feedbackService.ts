import "server-only";
import type { FeedbackInput } from "@/app/(view)/sview/profile/helper/profileHelper";
import type { CustomerFeedback } from "@/app/(view)/sview/profile/services/profileService";
import { feedback as copy } from "@/app/(view)/sview/profile/content/profileContent";
import { HttpError } from "@/server/core/httpError";
import type { MailService } from "@/server/features/mail/service/mailService";
import type { OrderRepository } from "@/server/features/order/repository/orderRepository";
import type { FeedbackRepository, FeedbackRow } from "../repository/feedbackRepository";
import { feedbackNotificationTemplate } from "../template/feedbackNotificationTemplate";

/** Earlier feedback shown on the profile page. */
const HISTORY_SIZE = 10;

const toCustomerFeedback = (row: FeedbackRow): CustomerFeedback => ({
  id: row.id,
  rating: row.rating,
  topic: row.topic,
  message: row.message,
  reference: row.orderReference,
  createdAt: row.createdAt.toISOString(),
});

export class FeedbackService {
  private readonly feedback: FeedbackRepository;
  private readonly orders: OrderRepository;
  private readonly mail: MailService;

  constructor(feedback: FeedbackRepository, orders: OrderRepository, mail: MailService) {
    this.feedback = feedback;
    this.orders = orders;
    this.mail = mail;
  }

  list(userId: string): Promise<CustomerFeedback[]> {
    return this.feedback.listForUser(userId, HISTORY_SIZE).then((rows) => rows.map(toCustomerFeedback));
  }

  /** Saves the customer's feedback and emails the support inbox. An order must be one of theirs. */
  async send(user: { id: string; email: string }, input: FeedbackInput): Promise<CustomerFeedback> {
    if (input.reference) {
      const order = await this.orders.find(input.reference);
      if (order?.userId !== user.id) throw HttpError.badRequest(copy.errors.order, { reference: copy.errors.order });
    }
    const entry = toCustomerFeedback(
      await this.feedback.create({
        userId: user.id,
        rating: input.rating,
        topic: input.topic,
        message: input.message,
        orderReference: input.reference || null,
      }),
    );
    // Saved already, so a failed email is logged rather than shown to the customer.
    try {
      await this.mail.sendTemplate(feedbackNotificationTemplate, { email: user.email, entry }, { to: this.mail.supportInbox, replyTo: user.email });
    } catch (error) {
      console.error(`[feedback] ${entry.id}: couldn't email support.`, error);
    }
    return entry;
  }
}
