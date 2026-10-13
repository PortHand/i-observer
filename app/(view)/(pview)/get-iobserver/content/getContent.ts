// Static content for the "Get iObserver" page.

import { appInfo } from "../../home/content/homeContent";

export const getApp = {
  eyebrow: "Get iObserver",
  title: "Up and running in a day.",
  lead: "Share your contact details, pay by UPI QR and send us the transaction details. Your login lands in your inbox within 24 hours.",
};

/** UPI payee the QR code pays. */
export const payment = {
  // TODO: replace with the real UPI ID and payee name.
  upiId: "yourname@upi",
  payeeName: "iObserver",
  currency: "INR",
  /** Mailbox for payment questions and the "email us instead" fallback. */
  supportEmail: appInfo.supportEmail,
};

export type PlanId = "monthly" | "yearly" | "lifetime";

export interface PricePlan {
  id: PlanId;
  name: string;
  /** Amount in rupees, paid once by UPI. */
  amount: number;
  period: string;
  description: string;
  badge?: string;
}

// TODO: replace with the real plans and prices.
export const pricePlans: PricePlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    amount: 499,
    period: "1 month",
    description: "Try it for an interview season or a busy month.",
  },
  {
    id: "yearly",
    name: "Yearly",
    amount: 3999,
    period: "12 months",
    description: "Two-thirds off the monthly price for regular presenters.",
    badge: "Best value",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    amount: 7999,
    period: "One-time",
    description: "Pay once, including every future update.",
  },
];

export const defaultPlanId: PlanId = "yearly";

export interface GetStep {
  title: string;
  description: string;
}

export const getSteps: GetStep[] = [
  {
    title: "Plan and details",
    description: "Pick a plan, then enter the email and phone number we should send your login to.",
  },
  {
    title: "Scan and pay",
    description: "Scan the QR code with any UPI app, or open the app directly on your phone.",
  },
  {
    title: "Share the transaction",
    description: "Send us the UTR / transaction ID and, if you like, a screenshot of the payment.",
  },
  {
    title: "Get your login",
    description: "We verify the payment and email your credentials within 24 hours.",
  },
];

/** Anchor id of the checkout section, linked from the steps above it. */
export const checkoutSectionId = "checkout";

export type CheckoutStep = "contact" | "pay" | "transaction" | "done";

/** PDF receipt downloaded from the success screen. */
export const receipt = {
  title: "Payment receipt",
  badge: "Order successful",
  message: "Login credentials will be shared on {email} within 24 hours.",
  status: "Payment submitted · verification within 24 hours",
  labels: {
    status: "Status",
    plan: "Plan",
    amount: "Amount",
    reference: "Reference",
    utr: "UTR / transaction ID",
    paidTo: "Paid to (UPI)",
    email: "Login goes to",
    phone: "Phone",
    screenshot: "Screenshot",
    submitted: "Submitted",
    loginBy: "Login expected by",
  },
  noScreenshot: "Not attached",
  screenshotTitle: "Payment screenshot",
  screenshotMissing: "No screenshot was attached to this order.",
  screenshotUnavailable: "A screenshot was submitted but is no longer available on this device.",
  footer: [
    "We verify the payment and email your login within 24 hours of submission.",
    "Questions? Write to {supportEmail} and quote your reference.",
  ],
};

export const checkout = {
  eyebrow: "Checkout",
  title: "Three steps to your login.",
  lead: "Choose a plan, pay with any UPI app, then share the transaction ID. We verify it and email your login within 24 hours.",
  /** The three steps the customer completes; "done" marks all of them complete. */
  progress: [
    { step: "contact", label: "Choose a plan", hint: "Plan, email and phone" },
    { step: "pay", label: "Pay by UPI", hint: "Scan the QR code" },
    { step: "transaction", label: "Share payment", hint: "UTR / transaction ID" },
  ] satisfies { step: CheckoutStep; label: string; hint: string }[],
  progressLabel: "Checkout progress",
  summary: {
    title: "Your order",
    label: "Plan",
    amountLabel: "Amount",
    deliveryLabel: "Delivery",
    delivery: "Login by email within 24 hours",
    contactLabel: "Contact",
    edit: "Edit",
    help: "Questions about paying?",
  },
  contact: {
    label: "Step 1 of 3",
    title: "Plan and contact details",
    description: "Your login is emailed here within 24 hours. We only call if there's a problem with the payment.",
    planLabel: "Choose a plan",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone number",
    phonePlaceholder: "98765 43210",
    phonePrefix: "+91",
    submit: "Generate QR code",
    invalidEmail: "Enter a valid email address.",
    invalidPhone: "Enter a 10-digit Indian mobile number.",
  },
  pay: {
    label: "Step 2 of 3",
    title: "Scan and pay",
    description: "Scan with GPay, PhonePe, Paytm, BHIM or any UPI app. The amount is filled in for you.",
    qrAlt: "UPI payment QR code",
    upiLabel: "UPI ID",
    referenceLabel: "Reference",
    referenceHint: "Added to the payment note so we can match it to you.",
    copy: "Copy",
    copied: "Copied",
    openApp: "Open UPI app",
    paid: "I've paid",
    back: "Back",
  },
  transaction: {
    label: "Step 3 of 3",
    title: "Share the transaction",
    description: "Find the UTR or transaction ID in your UPI app under the payment's details.",
    utrLabel: "UTR / transaction ID",
    utrPlaceholder: "12-digit number, e.g. 412345678901",
    screenshotLabel: "Payment screenshot (optional)",
    screenshotHint: "PNG or JPG, up to 5 MB.",
    submit: "Submit transaction",
    back: "Back to QR code",
    invalidUtr: "Enter the 12-digit UTR / transaction ID from your UPI app.",
    invalidScreenshot: "Upload a PNG or JPG image up to 5 MB.",
    emailInstead: "Trouble submitting? Email the details instead",
  },
  done: {
    title: "Order successful",
    message: "Login credentials will be shared on {email} within 24 hours.",
    nextTitle: "What happens next",
    next: {
      received: { title: "Payment details received", detail: "UTR {utr}" },
      verifying: { title: "Verifying your payment", detail: "We match your UTR with our bank record." },
      emailed: { title: "Login credentials emailed", detail: "By {loginBy}" },
    },
    download: "Download PDF receipt",
    downloadFailed: "Couldn't create the PDF. Please try again.",
    supportTitle: "Didn't get the email within 24 hours?",
    supportText: "Check your spam folder first, then contact support with your reference {reference}.",
    supportCta: "Contact support",
    supportSubject: "Login not received · {reference}",
  },
};
