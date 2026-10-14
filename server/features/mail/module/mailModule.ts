// Wires the mail feature together from environment variables (see .env.example). Other features
// take mailService in their constructor.

import "server-only";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { isValidEmail } from "@/app/(view)/(pview)/home/helper/homeHelper";
import { MailService, type BccSettings } from "../service/mailService";
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

const BCC_PREFIX = "MAIL_BCC_";

/** "a@x.com, b@y.com" → ["a@x.com", "b@y.com"], dropping (and warning about) anything that isn't an email. */
const parseAddresses = (name: string, value = "") =>
  value
    .split(",")
    .map((address) => address.trim())
    .filter((address) => {
      if (!address) return false;
      if (isValidEmail(address)) return true;
      console.warn(`[mail] Ignoring "${address}" in ${name}: not an email address.`);
      return false;
    });

/** MAIL_BCC for every email, plus MAIL_BCC_<FEATURE> for each feature, e.g. MAIL_BCC_PAYMENT. */
const readBcc = (): BccSettings => ({
  all: parseAddresses("MAIL_BCC", process.env.MAIL_BCC),
  byFeature: Object.fromEntries(
    Object.entries(process.env)
      .filter(([name, value]) => name.startsWith(BCC_PREFIX) && value)
      .map(([name, value]) => [name.slice(BCC_PREFIX.length).toLowerCase(), parseAddresses(name, value)]),
  ),
});

export const mailService = new MailService(getTransport, {
  from: process.env.MAIL_FROM ?? `${appInfo.name} Support <${appInfo.supportEmail}>`,
  supportInbox: process.env.SUPPORT_INBOX ?? appInfo.supportEmail,
  bcc: readBcc(),
});
