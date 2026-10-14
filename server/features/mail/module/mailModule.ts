// Wires the mail feature together from environment variables (see .env.example). Other features
// take mailService in their constructor.

import "server-only";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { isValidEmail } from "@/app/(view)/(pview)/home/helper/homeHelper";
import { env } from "@/server/core/env";
import { MailService, type BccSettings } from "../service/mailService";
import { ConsoleTransport } from "../transport/consoleTransport";
import type { MailTransport } from "../transport/mailTransport";
import { SmtpTransport } from "../transport/smtpTransport";

let transport: MailTransport | null = null;

const getTransport = (): MailTransport => {
  if (transport) return transport;
  const { host, port, secure, user, password } = env.mail.smtp;
  if (!host) {
    if (env.isProduction) throw new Error("SMTP_HOST is not set, so email can't be sent.");
    return (transport = new ConsoleTransport());
  }
  return (transport = new SmtpTransport({ host, port, secure, user, password }));
};

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
  all: parseAddresses("MAIL_BCC", env.mail.bcc),
  byFeature: Object.fromEntries(
    Object.entries(env.mail.bccByFeature).map(([feature, value]) => [
      feature,
      parseAddresses(`MAIL_BCC_${feature.toUpperCase()}`, value),
    ]),
  ),
});

export const mailService = new MailService(getTransport, {
  from: env.mail.from ?? `${appInfo.name} Support <${appInfo.supportEmail}>`,
  supportInbox: env.mail.supportInbox ?? appInfo.supportEmail,
  bcc: readBcc(),
});
