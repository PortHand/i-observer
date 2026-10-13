// Static content for the Contact page.

import { appInfo } from "../../home/content/homeContent";
import { routes } from "@/helper/route";

/** Anchor ids, so the hero list and the FAQ can link between sections. */
export const sectionIds = {
  message: "message",
  faq: "faq",
};

export const intro = {
  eyebrow: "Contact",
  title: "Talk to us.",
  lead: "Questions about a payment, your login or the app? Check the common questions below, or write to us by email or with the form. A person reads every message.",
};

export const contactEmail = {
  label: "Email us",
  address: appInfo.supportEmail,
  responseTime: "We usually reply within 24 hours.",
  copy: "Copy",
  copied: "Copied",
  open: "Open in mail app",
};

export const beforeYouWrite = {
  title: "Before you write",
  items: [
    {
      title: "Paid but no login yet?",
      text: "Logins arrive within 24 hours of sharing your transaction. Check spam, then send us your order reference.",
    },
    {
      title: "Have a quick question?",
      text: "Payments, logins, screen sharing and shortcuts are covered in the FAQ.",
      link: { href: `#${sectionIds.faq}`, label: "Browse the FAQ" },
    },
    {
      title: "New to iObserver?",
      text: "See what it does and which systems it supports.",
      link: { href: routes.whatIsIObserver, label: "What is iObserver?" },
    },
    {
      title: "Ready to buy?",
      text: "Pick a plan and pay by UPI in three steps.",
      link: { href: routes.getIObserver, label: "Get iObserver" },
    },
  ],
};

export type TopicId = "payment" | "login" | "technical" | "pricing" | "other";

export const topics: { id: TopicId; label: string; description: string }[] = [
  { id: "payment", label: "Payment or order", description: "UPI payment, receipt or order details" },
  { id: "login", label: "Login not received", description: "Paid, but no credentials after 24 hours" },
  { id: "technical", label: "Technical help", description: "Installing, the overlay or screen sharing" },
  { id: "pricing", label: "Plans and pricing", description: "Choosing or changing a plan" },
  { id: "other", label: "Something else", description: "Anything not listed above" },
];

/** Topics where an order reference helps us find the payment. */
export const topicsWithReference: TopicId[] = ["payment", "login"];

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

export const form = {
  label: "Send a message",
  title: "How can we help?",
  description: "Fields marked optional can be left blank.",
  nameLabel: "Your name",
  namePlaceholder: "Full name",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  phoneLabel: "Phone (optional)",
  phonePrefix: "+91",
  phonePlaceholder: "98765 43210",
  topicLabel: "Topic",
  topicPlaceholder: "Choose a topic",
  referenceLabel: "Order reference (optional)",
  referencePlaceholder: "IOB-AB12CD",
  referenceHint: "Printed on your receipt and in the UPI payment note.",
  messageLabel: "Message",
  messagePlaceholder: "Tell us what happened and what you need.",
  submit: "Send message",
  privacy: "We only use these details to reply to you.",
  errors: {
    name: "Enter your name.",
    email: "Enter a valid email address.",
    phone: "Enter a 10-digit Indian mobile number, or leave it blank.",
    topic: "Choose a topic.",
    reference: "References look like IOB-AB12CD.",
    messageShort: `Write at least ${MESSAGE_MIN} characters so we can help.`,
    messageLong: `Keep the message under ${MESSAGE_MAX} characters.`,
  },
};

export const sent = {
  title: "Message sent",
  text: "Thanks, {name}. We'll reply to {email} within 24 hours.",
  ticketLabel: "Ticket",
  another: "Send another message",
};
