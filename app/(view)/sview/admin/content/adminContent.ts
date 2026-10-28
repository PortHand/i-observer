// Static content for the admin portal.

import type { ReviewAction, StatusFilter } from "../services/adminService";

export const portal = {
  tagline: "Admin portal",
  overviewHeading: "Overview",
  dashboard: "Dashboard",
  ordersHeading: "Orders",
  storeHeading: "Store",
  plans: "Plans & pricing",
  offerTimer: "Offer timer",
  upiAccounts: "UPI accounts",
  appHeading: "Desktop app",
  appUpdate: "Force update",
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
  tabsLabel: "Order status",
  columns: { reference: "Order", utr: "UTR" },
  noUtr: "Not sent",
  morePlans: "+{count}",
  sentOn: "Sent {date}",
  createdOn: "Created {date}",
  review: "Review",
  open: "Open",
  copyUtr: "Copy UTR",
  copied: "Copied",
  loading: "Loading orders…",
  keysHint: "Arrow keys to move · Enter to open",
  showing: "Showing {from}–{to} of {total}",
  count: "{count} orders",
  countOne: "1 order",
  empty: "No orders here.",
  emptySearch: "No orders match this search.",
  previous: "Previous",
  next: "Next",
  page: "Page {page} of {pages}",
};

export const detail = {
  back: "All orders",
  sections: { customer: "Customer", payment: "Payment", plans: "Plans", review: "Review", receipt: "Payment screenshot" },
  receipt: {
    alt: "Payment screenshot sent by the customer for {reference}",
    open: "Open full size",
    /** The full-window preview opened by clicking the screenshot (ReceiptImage.tsx). */
    preview: { open: "Preview payment screenshot", actual: "Show actual size", fit: "Fit to window", close: "Close preview" },
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
  lead: "Payments waiting on you, and how sales are going. Days are in IST.",
  asOf: "Updated {time}",
  loading: "Loading…",
  rangeLabel: "Period",
  /** Range picker labels, by number of days. */
  ranges: { 7: "7 days", 30: "30 days", 90: "90 days" },
  /** "vs previous {range}" under a figure that changed. */
  versus: "vs previous {range}",
  noPrevious: "Nothing in the previous {range}",
  hero: {
    label: "Payments to review",
    waiting: "Oldest waiting {age}",
    none: "Nothing waiting. You're all caught up.",
    cta: "Review payments",
  },
  tiles: {
    revenue: { label: "Approved revenue" },
    orders: { label: "Orders placed" },
    average: { label: "Average order", caption: "Per approved payment", empty: "No approved payments yet" },
  },
  trend: {
    title: "Approved revenue per day",
    caption: "{amount} from {orders} in the last {range}",
    empty: "No payments approved in this period.",
    viewTable: "View as table",
    tableCaption: "Approved revenue and orders placed per day",
    columns: { day: "Day", revenue: "Approved", approved: "Payments", orders: "Orders placed" },
    today: "Today",
  },
  mix: {
    title: "Orders by status",
    caption: "All time · {total}",
    empty: "No orders yet.",
  },
  performance: {
    title: "Performance",
    approval: { label: "Approval rate", caption: "{approved} approved, {rejected} rejected", empty: "No payments decided yet" },
    reviewTime: { label: "Average review time", caption: "From UTR to decision", empty: "No payments decided yet" },
    paidRate: { label: "Payment rate", caption: "{paid} of {orders} sent a UTR", empty: "No orders placed yet" },
    today: { label: "Orders today", caption: "Placed since midnight" },
  },
  orders: { one: "1 order", many: "{count} orders" },
  payments: { one: "1 payment", many: "{count} payments" },
  queue: { title: "Next to review", link: "View all", empty: "No payments waiting." },
  recent: { title: "Recent decisions", link: "All orders", empty: "No payments reviewed yet." },
};

/** Longest message shown on the app's update screen. */
export const APP_UPDATE_MESSAGE_MAX = 300;

export const appUpdate = {
  eyebrow: "Desktop app",
  title: "Force update",
  lead: "Block older versions of the app until users install the latest one. Publish the new installers and raise the website's version first, then set the minimum here.",
  latest: "The website hands out v{version}.",
  status: {
    on: "On: apps older than v{version} are blocked.",
    off: "Off: every version of the app can be used.",
  },
  updated: "Last saved {date} by {admin}",
  neverSaved: "Never saved. Force update is off.",
  forceLabel: "Require an update",
  forceHint: "The app checks each time it opens. Users on an older version see an update screen they can't close, and the overlay won't start until they update.",
  versionLabel: "Minimum version",
  versionHint: "Apps older than this must update. Usually the latest version.",
  versionPlaceholder: "1.2.0",
  messageLabel: "Message to users (optional)",
  messagePlaceholder: "e.g. This update fixes screen sharing in Zoom 6.",
  messageHint: "Shown on the update screen. Leave empty for the default text.",
  save: "Save",
  saving: "Saving…",
  saved: "Saved. Apps pick this up the next time they open.",
  confirm: {
    title: "Force everyone to update?",
    description: "From its next launch, every app older than v{version} is blocked until the user installs the update. Apps already open keep working until they are closed.",
    action: "Force update",
    cancel: "Cancel",
  },
  errors: {
    version: "Enter a version like 1.2.0.",
    aheadOfLatest: "The website hands out v{latest}. Publish the new version first, or users would have nothing to update to.",
    messageLong: `Keep the message under ${APP_UPDATE_MESSAGE_MAX} characters.`,
  },
};

/** Most plans on sale at once: the pricing grids are laid out for 2 to 4 columns. */
export const OFFER_HEADLINE_MAX = 60;
/** Length a reset runs for when the timer was never saved. */
export const OFFER_TIMER_DEFAULT_HOURS = 24;
/** Longest timer the form accepts: 30 days. */
export const OFFER_TIMER_MAX_HOURS = 720;

export const offerTimerPage = {
  eyebrow: "Store",
  title: "Offer timer",
  lead: "A countdown shown above the plans on the home page and at checkout. It's display only: change prices on the Plans page.",
  defaultHeadline: "Offer ends in",
  status: {
    on: "On: ends {date}.",
    restarting: "On: ends {date}, then restarts every {hours} h.",
    ended: "On, but it has run out: customers see no countdown. Reset it or pick a new end time.",
    off: "Off: no countdown is shown.",
  },
  updated: "Last saved {date} by {admin}",
  neverSaved: "Never saved. The timer is off.",
  enabledLabel: "Show the countdown",
  enabledHint: "Shown above the plan cards on the home page and at the top of checkout.",
  headlineLabel: "Headline",
  headlinePlaceholder: "e.g. Diwali offer ends in",
  headlineHint: "Shown before the countdown.",
  endsAtLabel: "Ends at (IST)",
  endsAtPlaceholder: "Pick when the offer ends",
  endsAtHint: "When the countdown reaches zero. Reset sets it to now plus the timer length.",
  hoursLabel: "Timer length (hours)",
  hoursHint: "How long a reset runs for, and each automatic restart. 24 = one day, 168 = one week.",
  restartLabel: "Restart automatically",
  restartHint: "When it reaches zero, the countdown starts again for the timer length. Off: it disappears at zero.",
  save: "Save",
  saving: "Saving…",
  saved: "Saved. The website shows the change straight away.",
  reset: "Reset timer",
  resetDone: "Timer reset. It now ends {date}.",
  confirmReset: {
    title: "Reset the timer?",
    description: "The countdown starts again from now and ends in {hours} h. The other settings in the form are saved too.",
    action: "Reset timer",
    cancel: "Cancel",
  },
  errors: {
    headlineMissing: "Enter a headline.",
    headlineLong: `Keep the headline under ${OFFER_HEADLINE_MAX} characters.`,
    hours: `Enter whole hours from 1 to ${OFFER_TIMER_MAX_HOURS}.`,
    endsAt: "Pick the date and time the offer ends.",
    endsAtPast: "That time has passed. Pick a later one, turn on Restart automatically, or use Reset timer.",
  },
};

export const UPI_PAYEE_NAME_MAX = 50;

export const upiPage = {
  eyebrow: "Store",
  title: "UPI accounts",
  lead: "The checkout QR code pays the active account. Orders already placed keep the UPI ID they were shown.",
  add: "Add account",
  empty: "No UPI accounts yet. Checkout can't take payments until one is added and active.",
  noneActive: "No account is active, so checkout can't take payments. Make one active.",
  columns: { upiId: "UPI ID", payeeName: "Payee name", updated: "Updated", status: "Status" },
  active: "Active",
  inactive: "Inactive",
  /** The status switch's label for screen readers. */
  switchLabel: "{upiId} takes payments",
  edit: "Edit",
  delete: "Delete",
  form: {
    addTitle: "Add a UPI account",
    editTitle: "Edit UPI account",
    upiIdLabel: "UPI ID",
    upiIdPlaceholder: "e.g. ioverlay@okaxis",
    upiIdHint: "The VPA customers pay. Check it by paying ₹1 to it from your own UPI app first.",
    payeeNameLabel: "Payee name",
    payeeNamePlaceholder: "e.g. iOverlay",
    payeeNameHint: "Shown in the customer's UPI app.",
    activeWarning: "This account takes payments now: new orders pay the changed ID as soon as you save.",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
  },
  /** Rows of the confirmations' summary: which account each change affects. */
  change: {
    activate: "Takes payments",
    replaced: "Becomes inactive",
    deactivate: "Stops taking payments",
    delete: "Account",
  },
  confirmActivate: {
    title: "Make this account active?",
    description: "New orders' QR codes pay this account from now on. Only one account can be active. Orders already placed keep the UPI ID they were shown.",
    action: "Make active",
    cancel: "Cancel",
  },
  confirmDeactivate: {
    title: "Make this account inactive?",
    description: "No account will be active, so checkout stops taking orders until you make one active. Orders already placed keep the UPI ID they were shown.",
    action: "Make inactive",
    cancel: "Cancel",
  },
  confirmDelete: {
    title: "Delete this account?",
    description: "It's removed from this list. Orders that paid it keep their UPI ID.",
    action: "Delete",
    cancel: "Cancel",
  },
  saved: "Saved {upiId}.",
  activated: "{upiId} now takes payments.",
  deactivated: "{upiId} is inactive. Checkout takes no payments until an account is active.",
  deleted: "Deleted {upiId}.",
  errors: {
    upiId: "Enter a UPI ID like name@bank.",
    payeeNameMissing: "Enter the payee name.",
    payeeNameLong: `Keep the payee name under ${UPI_PAYEE_NAME_MAX} characters.`,
    upiIdTaken: "That UPI ID is already in the list.",
    notFound: "That account no longer exists. Reload the page.",
    deleteActive: "The active account can't be deleted. Make it inactive first.",
    /** Shown to customers at checkout when no account is active. */
    paymentsPaused: "Payments are paused for a few minutes. Please try again shortly.",
  },
};

export const MAX_PLANS_ON_SALE = 4;

export const plansPage = {
  eyebrow: "Store",
  title: "Plans & pricing",
  lead: `The plans customers can buy, on the website and in the desktop app. Up to ${MAX_PLANS_ON_SALE} can be on sale at once; they show side by side in sort order. Changes show within a minute.`,
  onSaleCount: `{count} of ${MAX_PLANS_ON_SALE} on sale`,
  add: "Add plan",
  addFull: `${MAX_PLANS_ON_SALE} plans are on sale: turn one off to add another.`,
  empty: "No plans yet. Add the first one.",
  columns: { plan: "Plan", price: "Price", rules: "Rules", status: "Status" },
  edit: "Edit",
  /** The on/off switch in each row; read with the plan's name. */
  toggle: { on: "On sale", off: "Off", label: "{plan} on sale" },
  turnedOn: "{plan} is on sale. The website and the app show it within a minute.",
  turnedOff: "{plan} is off. It's hidden from the website and the app.",
  lifetime: "Lifetime",
  months: (months: number) => (months === 1 ? "1 month" : `${months} months`),
  hours: (hours: number) => (hours === 1 ? "1 hour" : `${hours} hours`),
  maxPerOrder: (max: number) => `Up to ${max} per order`,
  noPrice: "No price",
  off: "{percent}% off",
  status: { onSale: "On sale", scheduled: "Outside sale window", noPrice: "Hidden: no price", off: "Off" },
  defaultTag: "Default",
  saleRunning: "Sale price {price} runs until {date}, then this price applies.",
  form: {
    back: "All plans",
    newTitle: "New plan",
    editTitle: "{plan}",
    details: "Details",
    detailsLead: "What customers see on the pricing card and at checkout.",
    price: "Price",
    rules: "Rules",
    rulesLead: "How long access lasts, how many can be bought, and when the plan is on sale.",
    previewTitle: "Preview",
    previewHint: "How the card looks on the website and in the desktop app. The highlighted style marks the default plan.",
    idLabel: "Plan id",
    idHint: "Lowercase letters, numbers and dashes, e.g. two-years. Used in checkout links and on orders, so it can't be changed later.",
    nameLabel: "Name",
    namePlaceholder: "Yearly",
    periodLabel: "Shown under the price",
    periodPlaceholder: "12 months",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Best for a full year of interviews.",
    badgeLabel: "Ribbon (optional)",
    badgePlaceholder: "Best value",
    priceLabel: "Price customers pay (₹)",
    priceZeroHint: "0 makes it a free plan: no payment step. Each email and phone number can claim it once, and access starts straight away.",
    compareAtLabel: "Original price (₹, optional)",
    compareAtHint: "Shown struck through next to the price, with the % off. Leave empty for no discount.",
    priceHint: "A new price applies to new orders. Orders already placed keep the price they were made at.",
    durationUnitLabel: "Access counted in",
    durationUnits: { months: "Months", hours: "Hours", lifetime: "Lifetime" },
    durationLabel: { months: "Access length (months)", hours: "Access length (hours)" },
    durationHint: {
      months: "Calendar months: 15 Oct + 1 month ends 15 Nov.",
      hours: "Starts when the payment is approved, or when earlier time runs out. The app closes the overlay right on time.",
      lifetime: "Never expires.",
    },
    sortLabel: "Sort order",
    sortHint: "Lowest first, left to right.",
    maxQuantityLabel: "Most per order",
    maxQuantityHint: "Keep lifetime plans at 1.",
    fromLabel: "On sale from (IST, optional)",
    untilLabel: "On sale until (IST, optional)",
    windowHint: "Outside these dates the plan is hidden. Leave empty for no limit.",
    /** The sale-window pickers when left empty. */
    noLimit: "No limit",
    activeLabel: "On sale",
    activeHint: "Off hides the plan from the website and the app. Existing orders keep it.",
    defaultLabel: "Default plan",
    defaultHint: "Highlighted on the pricing cards and pre-selected at checkout. Replaces the current default.",
    save: "Save plan",
    create: "Add plan",
    saving: "Saving…",
    cancel: "Cancel",
  },
  saved: "Saved {plan}. The website and the app show it within a minute.",
  errors: {
    id: "Use lowercase letters, numbers and dashes, up to 32 characters.",
    idTaken: "A plan with this id already exists.",
    required: "Required.",
    tooLong: (max: number) => `Keep it under ${max} characters.`,
    duration: (unit: "months" | "hours", max: number) => `Enter whole ${unit} from 1 to ${max}.`,
    price: "Enter an amount in rupees, like 3999, or 0 for free.",
    compareAt: "The original price must be higher than the price customers pay.",
    sortOrder: "Enter a whole number from 0 to 999.",
    maxQuantity: "Enter a whole number from 1 to 99.",
    lifetimeQuantity: "Lifetime plans can only be bought one at a time.",
    date: "Pick a date and time.",
    dateOrder: "Must be after the start.",
    defaultInactive: "The default plan must be on sale.",
    tooMany: `Up to ${MAX_PLANS_ON_SALE} plans can be on sale at once. Turn another plan off first.`,
    notFound: "This plan no longer exists. Reload the page.",
    defaultOff: "This is the default plan. Make another plan the default before turning it off.",
  },
};
