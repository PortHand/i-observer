// To the support inbox when a customer sends feedback from their profile. Replying goes to them.

import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { feedback } from "@/app/(view)/sview/profile/content/profileContent";
import { topicLabel } from "@/app/(view)/sview/profile/helper/profileHelper";
import type { CustomerFeedback } from "@/app/(view)/sview/profile/services/profileService";
import { formatReceived, oneLine } from "@/server/features/contact/template/contactMailData";
import {
  defineMailTemplate,
  detailsList,
  detailsText,
  hero,
  layout,
  messageCard,
  sectionTitle,
  type DetailRow,
} from "@/server/features/mail/template/mailTemplate";

/** Feature name on feedback emails. Selects MAIL_BCC_FEEDBACK in .env. */
export const FEEDBACK_FEATURE = "feedback";

export interface FeedbackMailData {
  email: string;
  entry: CustomerFeedback;
}

export const feedbackNotificationTemplate = defineMailTemplate<FeedbackMailData>({
  id: "feedback.notification",
  feature: FEEDBACK_FEATURE,
  render: ({ email, entry }) => {
    const topic = topicLabel(entry.topic);
    const stars = `${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)} ${feedback.ratings[entry.rating - 1]}`;
    const rows: DetailRow[] = [
      { icon: "row-mail", label: "Customer", value: email, href: `mailto:${email}` },
      { icon: "row-topic", label: "Topic", value: topic },
      { icon: "row-topic", label: "Rating", value: stars },
      ...(entry.reference ? [{ icon: "row-order", label: "Order", value: entry.reference } as DetailRow] : []),
      { icon: "row-time", label: "Received", value: formatReceived(new Date(entry.createdAt)) },
    ];

    return {
      subject: oneLine(`Feedback ${entry.rating}/5 · ${topic} from ${email}`),
      text: ["New feedback from the profile page.", "", detailsText(rows), "", "Feedback:", entry.message].join("\n"),
      html: layout({
        preheader: `${entry.rating}/5: ${oneLine(entry.message).slice(0, 110)}`,
        footerNote: `Internal notification from ${appInfo.name} feedback.`,
        body: [
          hero({
            icon: "tile-inbox",
            eyebrow: "Feedback · New",
            title: "New customer feedback.",
            lead: `${email} rated iOverlay ${entry.rating} out of 5.`,
          }),
          sectionTitle("Details"),
          detailsList(rows),
          sectionTitle("Feedback"),
          messageCard(entry.message),
        ].join(""),
      }),
    };
  },
});
