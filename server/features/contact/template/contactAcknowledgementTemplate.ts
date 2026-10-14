// To the customer after they use the contact form, confirming we have their message.

import { formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import {
  button,
  codeCard,
  defineMailTemplate,
  detailsList,
  detailsText,
  hero,
  layout,
  messageCard,
  sectionTitle,
  siteLink,
  steps,
  type DetailRow,
} from "@/server/features/mail/template/mailTemplate";
import { CONTACT_FEATURE, oneLine, REPLY_WITHIN, topicLabel, type ContactMailData } from "./contactMailData";

/** To the customer, confirming we have their message. */
export const contactAcknowledgementTemplate = defineMailTemplate<ContactMailData>({
  id: "contact.acknowledgement",
  feature: CONTACT_FEATURE,
  render: ({ ticket, message }) => {
    const firstName = oneLine(message.name).split(" ")[0];
    const rows: DetailRow[] = [
      { icon: "row-topic", label: "Topic", value: topicLabel(message.topic) },
      ...(message.reference ? [{ icon: "row-order", label: "Order", value: message.reference } as DetailRow] : []),
      { icon: "row-mail", label: "Reply to", value: message.email },
      ...(message.phone ? [{ icon: "row-phone", label: "Phone", value: formatPhone(message.phone) } as DetailRow] : []),
    ];
    const lead = `Hi ${firstName}, thanks for contacting ${appInfo.name} support. A member of our team will reply to ${message.email} within ${REPLY_WITHIN}.`;
    const nextSteps = [
      { title: "We review your request", text: "A real person on our support team reads every message." },
      {
        title: `You hear back within ${REPLY_WITHIN}`,
        text: `Look out for an email from ${appInfo.supportEmail}, and check your spam folder if it isn't in your inbox.`,
      },
      { title: "Need to add something?", text: `Just reply to this email and keep ${ticket} in the subject.` },
    ];

    return {
      subject: `We've received your message · ${ticket}`,
      text: [
        `Hi ${firstName},`,
        "",
        `Thanks for contacting ${appInfo.name} support. A member of our team will reply to ${message.email} within ${REPLY_WITHIN}.`,
        "",
        `Your ticket: ${ticket} (quote it in any follow-up)`,
        "",
        "What happens next",
        ...nextSteps.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`),
        "",
        "Your request",
        detailsText(rows),
        "",
        "Your message:",
        message.message,
        "",
        `Help & FAQ: ${siteLink("/contact#faq")}`,
        "",
        `${appInfo.name} Support`,
      ].join("\n"),
      html: layout({
        preheader: `We'll reply within ${REPLY_WITHIN}. Your ticket is ${ticket}.`,
        footerNote: `You're receiving this email because you contacted ${appInfo.name} support.`,
        body: [
          hero({ icon: "tile-check", eyebrow: "Support · Ticket opened", title: "We've got your message.", lead }),
          codeCard({ label: "Your ticket", value: ticket, note: "Quote this number in any follow-up so we can find your request quickly." }),
          sectionTitle("What happens next"),
          steps(nextSteps),
          sectionTitle("Your request"),
          detailsList(rows),
          messageCard(message.message),
          button({ href: siteLink("/contact#faq"), label: "Browse the FAQ", trailingIcon: "button-arrow" }),
        ].join(""),
      }),
    };
  },
});
