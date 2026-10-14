// To the support inbox when someone uses the contact form. Replying goes straight to the customer.

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
  type DetailRow,
} from "@/server/features/mail/template/mailTemplate";
import {
  CONTACT_FEATURE,
  formatReceived,
  oneLine,
  REPLY_WITHIN,
  topicLabel,
  type ContactMailData,
} from "./contactMailData";

/** To the support inbox. Replying goes straight to the customer. */
export const contactNotificationTemplate = defineMailTemplate<ContactMailData>({
  id: "contact.notification",
  feature: CONTACT_FEATURE,
  render: ({ ticket, message, receivedAt }) => {
    const name = oneLine(message.name);
    const topic = topicLabel(message.topic);
    const rows: DetailRow[] = [
      { icon: "row-user", label: "Name", value: name },
      { icon: "row-mail", label: "Email", value: message.email, href: `mailto:${message.email}` },
      ...(message.phone
        ? [{ icon: "row-phone", label: "Phone", value: formatPhone(message.phone), href: `tel:+91${message.phone}` } as DetailRow]
        : []),
      { icon: "row-topic", label: "Topic", value: topic },
      ...(message.reference ? [{ icon: "row-order", label: "Order", value: message.reference } as DetailRow] : []),
      { icon: "row-time", label: "Received", value: formatReceived(receivedAt) },
    ];
    const replySubject = `Re: [${ticket}] ${topic}`;

    return {
      subject: oneLine(`[${ticket}] ${topic} from ${name}`),
      text: [
        `New support request ${ticket}. Reply to this email to answer ${name}; they were promised a reply within ${REPLY_WITHIN}.`,
        "",
        detailsText(rows),
        "",
        "Message:",
        message.message,
      ].join("\n"),
      html: layout({
        preheader: `${name}: ${oneLine(message.message).slice(0, 110)}`,
        footerNote: `Internal notification from the ${appInfo.name} contact form.`,
        body: [
          hero({
            icon: "tile-inbox",
            eyebrow: "Support · New request",
            title: "New support request.",
            lead: `${name} sent a message through the contact form. They were promised a reply within ${REPLY_WITHIN}.`,
          }),
          codeCard({ label: "Ticket", value: ticket, note: topic }),
          sectionTitle("Customer"),
          detailsList(rows),
          sectionTitle("Message"),
          messageCard(message.message),
          button({
            href: `mailto:${message.email}?subject=${encodeURIComponent(replySubject)}`,
            label: `Reply to ${name.split(" ")[0]}`,
            icon: "button-reply",
          }),
        ].join(""),
      }),
    };
  },
});
