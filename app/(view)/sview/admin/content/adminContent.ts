// Static content for the admin portal.

import type { ReviewAction, StatusFilter } from "../services/adminService";

export const portal = {
  tagline: "Admin portal",
  overviewHeading: "Overview",
  dashboard: "Dashboard",
  ordersHeading: "Orders",
  siteHeading: "Site",
  viewSite: "View website",
  signedInAs: "Signed in as",
  signOut: "Sign out",
  navLabel: "Admin",
};

/** Heading and intro above the order list, per status. */
export const listIntro: Record<StatusFilter, string> = {
  submitted: "Customers who sent a UTR. Check each against the bank statement, then approve or reject it. Oldest first.",
  pending: "Orders with a QR code shown but no UTR yet. Nothing to do until the customer pays.",
  verified: "Payments you approved. The customer has access and got their login by email.",
  rejected: "Payments with no match on the bank statement.",
  refunded: "Payments sent back to the customer. Their access from these orders was removed.",
  all: "Every order, newest first.",
};

/** Status tabs, in this order. "submitted" first: those are waiting on us. */
export const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: "submitted", label: "Needs review" },
  { id: "pending", label: "Awaiting payment" },
  { id: "verified", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "refunded", label: "Refunded" },
  { id: "all", label: "All" },
];

/** Badge text per status. */
export const statusLabels: Record<Exclude<StatusFilter, "all">, string> = {
  pending: "Awaiting payment",
  submitted: "Needs review",
  verified: "Approved",
  rejected: "Rejected",
  refunded: "Refunded",
};

export const list = {
  searchLabel: "Search orders",
  searchPlaceholder: "Reference, email or UTR",
  search: "Search",
  clear: "Clear",
  hasReceipt: "Screenshot attached",
  columns: { reference: "Order", customer: "Customer", plan: "Plan", amount: "Amount", utr: "UTR", date: "Date", status: "Status" },
  count: "{count} orders",
  countOne: "1 order",
  empty: "No orders here.",
  emptySearch: "No orders match this search.",
  previous: "Previous",
  next: "Next",
  page: "Page {page} of {pages}",
  submitted: "Sent {date}",
  created: "Created {date}",
};

export const detail = {
  back: "All orders",
  sections: { customer: "Customer", payment: "Payment", plans: "Plans", review: "Review", receipt: "Payment screenshot" },
  receipt: {
    alt: "Payment screenshot sent by the customer for {reference}",
    open: "Open full size",
    expires: "Link works for 15 minutes. Reload the page for a new one.",
    none: "The customer didn't attach a screenshot.",
    unavailable: "A screenshot was saved but can't be shown. Check the Supabase settings (SUPABASE_URL, SUPABASE_SECRET_KEY) and the server log.",
  },
  labels: {
    email: "Email",
    phone: "Phone",
    username: "Username",
    access: "Access",
    noAccount: "No account linked",
    amount: "Amount",
    utr: "UTR",
    payee: "Paid to",
    created: "Created",
    submitted: "UTR sent",
    reviewed: "Reviewed",
    note: "Note",
    total: "Total",
  },
  access: { lifetime: "Lifetime", until: "Until {date}", none: "None" },
  noUtr: "Not sent yet",
  notFound: "There's no order with this reference.",
  /** Shown instead of actions when nothing can be done. */
  noActions: {
    pending: "Waiting for the customer to pay and send the UTR. Nothing to review yet.",
    rejected: "This payment was rejected. The customer can place a new order.",
    refunded: "This payment was refunded and its access taken back.",
  },
};

/** The review buttons, and the confirmation each opens. */
export const actions: Record<ReviewAction, { label: string; title: string; description: string; confirm: string; tone: "primary" | "secondary" }> = {
  verify: {
    label: "Approve payment",
    title: "Approve this payment?",
    description: "Only if the UTR and amount match the bank statement. The customer gets access now and their login by email.",
    confirm: "Approve",
    tone: "primary",
  },
  reject: {
    label: "Reject",
    title: "Reject this payment?",
    description: "The customer is emailed that no matching payment was found. This can't be undone.",
    confirm: "Reject",
    tone: "secondary",
  },
  refund: {
    label: "Mark refunded",
    title: "Mark as refunded?",
    description: "Only after the money is back with the customer. Their access from this order is taken away.",
    confirm: "Mark refunded",
    tone: "secondary",
  },
  resend: {
    label: "Resend login email",
    title: "Email the login again?",
    description: "Sends the customer their username and password again.",
    confirm: "Send",
    tone: "secondary",
  },
};

export const review = {
  noteLabel: "Note (only admins see it)",
  notePlaceholder: "e.g. Matched on HDFC statement, 15 Oct",
  cancel: "Cancel",
  done: {
    verify: "Payment approved. The customer has access.",
    reject: "Payment rejected.",
    refund: "Marked as refunded. Access taken back.",
    resend: "Login email sent again.",
  } satisfies Record<ReviewAction, string>,
  emailed: " The customer was emailed.",
  emailFailed: " But the email to the customer failed: check the server log, then use Resend.",
};

export const dashboard = {
  eyebrow: "Overview",
  title: "Dashboard",
  lead: "Payments waiting on you, and how sales are going. Days and months are in IST.",
  hero: {
    label: "Payments to review",
    waiting: "Oldest waiting {age}",
    none: "Nothing waiting. You're all caught up.",
    cta: "Review payments",
  },
  tiles: {
    revenue: { label: "Approved this month", caption: "{orders} · last month {amount}" },
    today: { label: "Orders today", caption: "Placed since midnight" },
    pending: { label: "Awaiting payment", caption: "QR shown, no UTR yet" },
  },
  orders: { one: "1 order", many: "{count} orders" },
  queue: { title: "Next to review", link: "View all", empty: "No payments waiting." },
  recent: { title: "Recent decisions", link: "All orders", empty: "No payments reviewed yet." },
};
