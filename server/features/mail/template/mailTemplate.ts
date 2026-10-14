// Email templates: how features describe the emails they send.
//
// The mail feature is generic. Each feature keeps its own emails in its own template/ folder, one
// file per email, and defines them with defineMailTemplate:
//
//   server/features/contact/template/contactAcknowledgementTemplate.ts   id "contact.acknowledgement"
//   server/features/payment/template/paymentReceivedTemplate.ts          id "payment.received"
//
// A template turns its data into a subject, a plain-text body and an HTML body. Build the HTML
// from the blocks in ./blocks and wrap it in ./layout, so every email shares the site's design.
// Send it with mailService.sendTemplate(template, data, { to }); the template's feature decides
// which BCC addresses from .env are added (see mailModule).
//
// Feature templates import everything they need from this file.

export interface MailContent {
  subject: string;
  /** Plain-text version, for clients that don't show HTML. Always required. */
  text: string;
  html: string;
}

export interface MailTemplate<Data> {
  /** Unique name, "<feature>.<purpose>", e.g. "contact.acknowledgement". Shown in logs. */
  id: `${string}.${string}`;
  /** Feature the email belongs to, e.g. "contact" or "payment". Selects MAIL_BCC_<FEATURE> in .env. */
  feature: string;
  /** True for emails holding a secret, such as a login code: no BCC copies, not even MAIL_BCC. */
  secret?: boolean;
  render: (data: Data) => MailContent;
}

/** Declares a feature's email template, checking that its id starts with its feature. */
export const defineMailTemplate = <Data>(template: MailTemplate<Data>): MailTemplate<Data> => {
  if (!template.id.startsWith(`${template.feature}.`)) {
    throw new Error(`Mail template "${template.id}" must start with its feature, "${template.feature}.".`);
  }
  return template;
};

export * from "./blocks";
export { inlineImages } from "./images";
export { layout } from "./layout";
export { escapeHtml, siteLink } from "./theme";
