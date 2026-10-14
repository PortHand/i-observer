import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { MailMessage, MailTransport } from "./mailTransport";

export interface SmtpSettings {
  host: string;
  port: number;
  /** True for port 465 (TLS from the start); false for 587, which upgrades with STARTTLS. */
  secure: boolean;
  user?: string;
  password?: string;
}

/** Sends through any SMTP server: Google Workspace, Zoho, Amazon SES, Resend, Brevo and so on. */
export class SmtpTransport implements MailTransport {
  private readonly transporter: Transporter;

  constructor({ host, port, secure, user, password }: SmtpSettings) {
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && { auth: { user, pass: password } }),
    });
  }

  async send(message: MailMessage & { from: string }): Promise<void> {
    await this.transporter.sendMail(message);
  }
}
