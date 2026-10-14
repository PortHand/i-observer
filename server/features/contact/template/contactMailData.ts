// Data and helpers shared by the contact feature's emails.

import { topics } from "@/app/(view)/(pview)/contact/content/contactContent";
import type { ContactMessage } from "@/app/(view)/(pview)/contact/helper/contactHelper";

/** Feature name on the contact emails. Selects MAIL_BCC_CONTACT in .env. */
export const CONTACT_FEATURE = "contact";

export interface ContactMailData {
  ticket: string;
  message: ContactMessage;
  receivedAt: Date;
}

/** Promised in the confirmation email. Keep in line with the contact page. */
export const REPLY_WITHIN = "24 hours";

export const topicLabel = (id: ContactMessage["topic"]) => topics.find((topic) => topic.id === id)?.label ?? id;

/** Line breaks in a header would let a sender add headers of their own. */
export const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** Support works in India, so times are shown in IST. */
export const formatReceived = (date: Date) =>
  `${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(date)} IST`;
