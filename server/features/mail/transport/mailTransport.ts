/** One email. `to`, `cc` and `bcc` take plain addresses or "Name <address>". */
export interface MailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  /** Where replies go when it isn't the sender, e.g. the customer on a support notification. */
  replyTo?: string;
  subject: string;
  /** Plain-text body, shown by clients that don't render HTML. Always required. */
  text: string;
  html?: string;
  attachments?: MailAttachment[];
}

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

/** Delivers a finished message. Swap implementations to change provider without touching callers. */
export interface MailTransport {
  send(message: MailMessage & { from: string }): Promise<void>;
}
