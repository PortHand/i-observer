// Wires the mail feature together from environment variables (see .env.example). Other features
// take mailService in their constructor.

import "server-only";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { MailService } from "../service/mailService";
import { ConsoleTransport } from "../transport/consoleTransport";
import type { MailTransport } from "../transport/mailTransport";
import { SmtpTransport } from "../transport/smtpTransport";

let transport: MailTransport | null = null;

const getTransport = (): MailTransport => {
  if (transport) return transport;
  const host = process.env.SMTP_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP_HOST is not set, so email can't be sent.");
    return (transport = new ConsoleTransport());
  }
  const port = Number(process.env.SMTP_PORT ?? 587);
  return (transport = new SmtpTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  }));
};

export const mailService = new MailService(getTransport, {
  from: process.env.MAIL_FROM ?? `${appInfo.name} Support <${appInfo.supportEmail}>`,
  supportInbox: process.env.SUPPORT_INBOX ?? appInfo.supportEmail,
});
