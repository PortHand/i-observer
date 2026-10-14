import "server-only";
import type { MailMessage, MailTransport } from "./mailTransport";

/** Prints emails to the server log instead of sending them. Used in development when SMTP isn't set up. */
export class ConsoleTransport implements MailTransport {
  async send({ from, to, replyTo, subject, text, attachments }: MailMessage & { from: string }): Promise<void> {
    const lines = [
      `From: ${from}`,
      `To: ${[to].flat().join(", ")}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      `Subject: ${subject}`,
      ...(attachments?.length ? [`Attachments: ${attachments.map((file) => file.filename).join(", ")}`] : []),
      "",
      text,
    ];
    console.info(`[mail] Not sent (SMTP_HOST is not set):\n${lines.join("\n")}\n`);
  }
}
