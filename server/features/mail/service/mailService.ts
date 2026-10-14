import "server-only";
import { inlineImages, type MailTemplate } from "../template/mailTemplate";
import type { MailMessage, MailTransport } from "../transport/mailTransport";

export interface BccSettings {
  /** Copied on every email (MAIL_BCC). */
  all: string[];
  /** Copied on one feature's emails only, keyed by feature (MAIL_BCC_CONTACT → "contact"). */
  byFeature: Record<string, string[]>;
}

export interface MailSettings {
  /** Sender on every email, e.g. "iOverlay Support <support@i-overlay.com>". */
  from: string;
  /** Inbox that receives internal notifications such as new contact messages. */
  supportInbox: string;
  bcc: BccSettings;
}

/** The bare address from "Name <address>" or "address", lower-cased for comparison. */
const addressOf = (recipient: string) => (/<([^>]+)>/.exec(recipient)?.[1] ?? recipient).trim().toLowerCase();

const asList = (value?: string | string[]) => (value === undefined ? [] : [value].flat());

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

  /** Sends a message written by hand. Only the MAIL_BCC addresses are copied. */
  async send(message: MailMessage): Promise<void> {
    await this.deliver(message);
  }

  /**
   * Renders a feature's template with `data` and sends it. `message` holds the recipients and
   * anything else. MAIL_BCC and the template feature's MAIL_BCC_<FEATURE> addresses are copied.
   */
  async sendTemplate<Data>(
    template: MailTemplate<Data>,
    data: Data,
    message: Omit<MailMessage, "subject" | "text" | "html">,
  ): Promise<void> {
    try {
      await this.deliver({ ...message, ...template.render(data) }, template.feature, template.secret);
    } catch (error) {
      const to = asList(message.to).join(", ");
      throw new Error(`Email "${template.id}" to ${to} failed: ${error instanceof Error ? error.message : error}`, {
        cause: error,
      });
    }
  }

  /** Adds the sender, BCC copies and embedded images, then hands the message to the transport. */
  private async deliver(message: MailMessage, feature?: string, secret = false) {
    const bcc = secret ? [] : this.bccFor(message, feature);
    const attachments = [...(message.attachments ?? []), ...(message.html ? inlineImages(message.html) : [])];
    await this.transport().send({
      from: this.settings.from,
      ...message,
      ...(bcc.length > 0 ? { bcc } : { bcc: undefined }),
      ...(attachments.length > 0 && { attachments }),
    });
  }

  /**
   * BCC for one email: the message's own, then MAIL_BCC, then the feature's. Each address once,
   * and never someone already in To or Cc, who would otherwise get the email twice.
   */
  private bccFor(message: MailMessage, feature?: string) {
    const visible = new Set([...asList(message.to), ...asList(message.cc)].map(addressOf));
    const seen = new Set<string>();
    return [
      ...asList(message.bcc),
      ...this.settings.bcc.all,
      ...(feature ? (this.settings.bcc.byFeature[feature] ?? []) : []),
    ].filter((recipient) => {
      const address = addressOf(recipient);
      if (visible.has(address) || seen.has(address)) return false;
      seen.add(address);
      return true;
    });
  }
}
