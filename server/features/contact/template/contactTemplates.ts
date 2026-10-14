// Emails sent when someone uses the contact form: a notification to the support inbox and a
// confirmation to the customer.

import { topics } from "@/app/(view)/(pview)/contact/content/contactContent";
import type { ContactMessage } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { formatPhone } from "@/app/(view)/(pview)/get-iobserver/helper/getHelper";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import {
  detailsTable,
  detailsText,
  escapeHtml,
  layout,
  quoteHtml,
  type MailTemplate,
} from "@/server/features/mail/template/mailTemplate";

export interface ContactMailData {
  ticket: string;
  message: ContactMessage;
}

/** Promised in the confirmation email. Keep in line with the contact page. */
const REPLY_WITHIN = "24 hours";

const topicLabel = (id: ContactMessage["topic"]) => topics.find((topic) => topic.id === id)?.label ?? id;

/** Line breaks in a header would let a sender add headers of their own. */
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

const detailRows = ({ ticket, message }: ContactMailData): [string, string][] => [
  ["Ticket", ticket],
  ["Topic", topicLabel(message.topic)],
  ["Name", message.name],
  ["Email", message.email],
  ...(message.phone ? [["Phone", formatPhone(message.phone)] as [string, string]] : []),
  ...(message.reference ? [["Order", message.reference] as [string, string]] : []),
];

/** To the support inbox. Replying goes straight to the customer. */
export const contactNotificationTemplate: MailTemplate<ContactMailData> = (data) => {
  const { ticket, message } = data;
  const rows = detailRows(data);
  return {
    subject: oneLine(`[${ticket}] ${topicLabel(message.topic)} from ${message.name}`),
    text: [
      `New contact message. Reply to this email to answer ${message.name}; reply within ${REPLY_WITHIN}.`,
      "",
      detailsText(rows),
      "",
      message.message,
    ].join("\n"),
    html: layout({
      preheader: message.message.slice(0, 120),
      body: [
        `<h1 style="margin:0 0 8px;font-size:20px">New contact message</h1>`,
        `<p style="margin:0;color:#615f5a">Reply to this email to answer ${escapeHtml(message.name)}. They were told to expect a reply within ${REPLY_WITHIN}.</p>`,
        detailsTable(rows),
        quoteHtml(message.message),
      ].join(""),
    }),
  };
};

/** To the customer, confirming we have their message. */
export const contactAcknowledgementTemplate: MailTemplate<ContactMailData> = (data) => {
  const { ticket, message } = data;
  const firstName = oneLine(message.name).split(" ")[0];
  const intro = `Thanks for getting in touch with ${appInfo.name}. Our team will reply to ${message.email} within ${REPLY_WITHIN}.`;
  const followUp = `To add anything, reply to this email and keep ${ticket} in the subject.`;
  return {
    subject: `We've got your message · ${ticket}`,
    text: [
      `Hi ${firstName},`,
      "",
      intro,
      "",
      detailsText(detailRows(data)),
      "",
      "Your message:",
      message.message,
      "",
      followUp,
      "",
      `${appInfo.name} Support`,
    ].join("\n"),
    html: layout({
      preheader: `We'll reply within ${REPLY_WITHIN}. Your ticket is ${ticket}.`,
      body: [
        `<h1 style="margin:0 0 12px;font-size:20px">We've got your message</h1>`,
        `<p style="margin:0 0 4px">Hi ${escapeHtml(firstName)},</p>`,
        `<p style="margin:0">${escapeHtml(intro)}</p>`,
        detailsTable(detailRows(data)),
        `<p style="margin:0;color:#615f5a">Your message:</p>`,
        quoteHtml(message.message),
        `<p style="margin:0">${escapeHtml(followUp)}</p>`,
        `<p style="margin:16px 0 0">${escapeHtml(appInfo.name)} Support</p>`,
      ].join(""),
    }),
  };
};
