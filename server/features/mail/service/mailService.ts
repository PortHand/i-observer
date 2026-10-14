import "server-only";
import type { MailTemplate } from "../template/mailTemplate";
import type { MailMessage, MailTransport } from "../transport/mailTransport";

export interface MailSettings {
  /** Sender on every email, e.g. "iObserver Support <support@i-overlay.com>". */
  from: string;
  /** Inbox that receives internal notifications such as new contact messages. */
  supportInbox: string;
}

/** Sends email for every feature. Get the shared instance from mailModule. */
export class MailService {
  private readonly transport: () => MailTransport;
  private readonly settings: MailSettings;

  /** `transport` is created on first send, so a missing SMTP setting doesn't break `next build`. */
  constructor(transport: () => MailTransport, settings: MailSettings) {
    this.transport = transport;
    this.settings = settings;
  }

  get supportInbox() {
    return this.settings.supportInbox;
  }

  /** Sends a message written by hand. */
  async send(message: MailMessage): Promise<void> {
    await this.transport().send({ from: this.settings.from, ...message });
  }

  /** Renders a template with `data` and sends it. `message` holds the recipients and anything else. */
  async sendTemplate<T>(
    template: MailTemplate<T>,
    data: T,
    message: Omit<MailMessage, "subject" | "text" | "html">,
  ): Promise<void> {
    await this.send({ ...message, ...template(data) });
  }
}
