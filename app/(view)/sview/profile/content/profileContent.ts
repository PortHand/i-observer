// Static content for the profile page: account, access, orders and feedback.

import type { OrderStatus } from "@/server/features/order/schema/orderSchema";

export const profile = {
  eyebrow: "Your account",
  title: "Profile",
  lead: "Your login, your plan, and a place to tell us how iOverlay works for you.",
};

export const ordersPage = {
  eyebrow: "Your account",
  title: "Orders",
  lead: "Every order and payment, where it stands, and what happens next.",
};

export const account = {
  label: "Account",
  email: "Login email",
  phone: "Phone",
  memberSince: "Member since",
  roles: { customer: "Customer", admin: "Admin" },
  passwordHint: "Your password is in the login email we sent when your payment was approved.",
};

export const access = {
  label: "Plan",
  states: {
    lifetime: { title: "Lifetime access", text: "Your plan never expires. Updates included." },
    active: { title: "Active", text: "Your access runs until {date}. Buy again any time: new time is added after this date." },
    expired: { title: "Expired", text: "Your access ended on {date}. Renew to keep using iOverlay." },
    none: { title: "No active plan", text: "Once a payment is approved your access starts and the download unlocks." },
  },
  daysLeft: "{days} days left",
  dayLeft: "1 day left",
  renew: "Renew plan",
  buy: "Get iOverlay",
  download: "Download app",
  orders: "See orders & payments",
};

export const orders = {
  label: "Orders & payments",
  title: "Your orders",
  empty: "No orders yet.",
  emptyCta: "Get iOverlay",
  count: { one: "1 order", many: "{count} orders" },
  totalPaid: "Total paid",
  columns: {
    reference: "Order",
    plan: "Plan",
    amount: "Amount",
    utr: "UTR",
    placed: "Placed",
    paid: "Payment sent",
    reviewed: "Decided",
    receipt: "Screenshot",
  },
  receiptAttached: "Attached",
  receiptMissing: "Not attached",
  help: "Something wrong with this order?",
  helpLink: "Contact support",
  pay: "Finish payment",
};

/** What each status means to the customer. */
export const statusText: Record<OrderStatus, { label: string; text: string }> = {
  pending: { label: "Awaiting payment", text: "We haven't received a UTR for this order yet." },
  submitted: { label: "Checking payment", text: "We're matching your UTR with our bank statement, usually within 24 hours." },
  verified: { label: "Approved", text: "Payment approved. The time is added to your plan." },
  rejected: { label: "Not approved", text: "We couldn't find this payment. Contact support with your UTR and screenshot." },
  refunded: { label: "Refunded", text: "The money was returned and this order's time was removed." },
};

export type FeedbackTopic = "app" | "download" | "payment" | "idea" | "other";

export const feedbackTopics: { id: FeedbackTopic; label: string }[] = [
  { id: "app", label: "Using the app" },
  { id: "download", label: "Download & install" },
  { id: "payment", label: "Payment & orders" },
  { id: "idea", label: "Feature idea" },
  { id: "other", label: "Something else" },
];

export const FEEDBACK_MAX = 1500;
export const FEEDBACK_MIN = 10;

export const feedback = {
  label: "Feedback",
  title: "How is iOverlay working for you?",
  description: "Tell us what works and what doesn't. We read every note.",
  ratingLabel: "Your rating",
  ratings: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  topicLabel: "About",
  topicPlaceholder: "Choose a topic",
  orderLabel: "Order (optional)",
  orderNone: "Not about an order",
  messageLabel: "Your feedback",
  messagePlaceholder: "What should we keep, fix or add?",
  submit: "Send feedback",
  sending: "Sending…",
  sent: "Thanks! Your feedback reached the team.",
  another: "Send more feedback",
  history: "Your earlier feedback",
  errors: {
    rating: "Choose a rating from 1 to 5.",
    topic: "Choose what your feedback is about.",
    messageShort: `Write at least ${FEEDBACK_MIN} characters.`,
    messageLong: `Keep it under ${FEEDBACK_MAX} characters.`,
    order: "Choose one of your own orders.",
  },
};
