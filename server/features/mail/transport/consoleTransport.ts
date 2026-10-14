import "server-only";
import type { MailMessage, MailTransport } from "./mailTransport";

/** Prints emails to the server log instead of sending them. Used in development when SMTP isn't set up. */
export class ConsoleTransport implements MailTransport {
  async send({ from, to, bcc, replyTo, subject, text, attachments }: MailMessage & { from: string }): Promise<void> {
    // Embedded images (logo, icons) are part of the HTML, not files the reader sees.
    const files = attachments?.filter((file) => !file.cid) ?? [];
    const lines = [
      `From: ${from}`,
      `To: ${[to].flat().join(", ")}`,
      ...(bcc?.length ? [`Bcc: ${[bcc].flat().join(", ")}`] : []),
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      `Subject: ${subject}`,
      ...(files.length ? [`Attachments: ${files.map((file) => file.filename).join(", ")}`] : []),
      "",
      text,
    ];
    console.info(`[mail] Not sent (SMTP_HOST is not set):\n${lines.join("\n")}\n`);
  }
}
