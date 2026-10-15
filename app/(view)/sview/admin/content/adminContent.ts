// Static content for the admin portal.

import type { ReviewAction, StatusFilter } from "../services/adminService";

export const portal = {
  eyebrow: "Admin portal",
  title: "Orders & payments",
  lead: "Check each submitted UTR against the bank statement, then approve or reject the payment.",
  signedInAs: "Signed in as",
  signOut: "Sign out",
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
  columns: { reference: "Order", customer: "Customer", plan: "Plan", amount: "Amount", utr: "UTR", date: "Date", status: "Status" },
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
  sections: { customer: "Customer", payment: "Payment", plans: "Plans", review: "Review" },
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
