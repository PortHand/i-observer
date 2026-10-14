import { payment, receipt } from "../content/getContent";
import type { Order, Payee, Plan, PlanId } from "../services/getService";

/**
 * Failure code meaning the email must be verified with an OTP first: the checkout opens the OTP
 * modal. Shared with the server (otpService), so it lives here rather than in services/getService.ts,
 * which loads the Server Actions and would make the server import itself in a circle.
 */
export const VERIFICATION_REQUIRED = "verification_required";

/** Failure code for an order reference the server doesn't have, e.g. one remembered from an old visit. */
export const ORDER_NOT_FOUND = "order_not_found";

export { isValidEmail } from "../../home/helper/homeHelper";

const SCREENSHOT_TYPES = ["image/png", "image/jpeg"];
const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;

/** Keeps the last 10 digits, so "+91 98765-43210" and "098765 43210" both become "9876543210". */
export const normalizePhone = (phone: string) => phone.replace(/\D/g, "").slice(-10);

/** Indian mobile numbers: 10 digits starting with 6–9. */
export const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(normalizePhone(phone));

/** UPI UTRs (RRNs) are 12 digits. */
export const normalizeUtr = (utr: string) => utr.replace(/\s/g, "");

export const isValidUtr = (utr: string) => /^\d{12}$/.test(normalizeUtr(utr));

export const isValidScreenshot = (file: File) =>
  SCREENSHOT_TYPES.includes(file.type) && file.size <= SCREENSHOT_MAX_BYTES;

export const formatPhone = (phone: string) => `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

/** Whole rupees without paise, e.g. "₹3,999". */
export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: payment.currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/** The plan marked default, else the first. Callers make sure there is at least one plan. */
export const defaultPlan = (plans: Plan[]) => plans.find((plan) => plan.isDefault) ?? plans[0];

/** Falls back to the default plan, e.g. for progress saved before a plan was hidden. */
export const getPlan = (plans: Plan[], id: PlanId) => plans.find((plan) => plan.id === id) ?? defaultPlan(plans);

export const planTitle = (plan: Pick<Plan, "name" | "period">) => `iOverlay ${plan.name} · ${plan.period}`;

// URLSearchParams encodes spaces as "+", which some UPI apps show literally in the payment note.
const toQuery = (params: Record<string, string>) =>
  new URLSearchParams(params).toString().replace(/\+/g, "%20");

/** UPI deep link (NPCI linking spec). Any UPI app can scan it as a QR code or open it on a phone. */
export const buildUpiLink = ({ reference, amount, payee }: Order) =>
  `upi://pay?${toQuery({
    pa: payee.upiId,
    pn: payee.name,
    am: amount.toFixed(2),
    cu: payment.currency,
    tn: `iOverlay ${reference}`,
  })}`;

export interface TransactionSummary {
  reference: string;
  planId: PlanId;
  email: string;
  phone: string;
  utr: string;
  submittedAt: string;
  planLabel: string;
  amount: number;
  payee: Payee;
  /** File name of the uploaded payment screenshot, if any. */
  screenshotName?: string | null;
}

const LOGIN_DELIVERY_MS = 24 * 60 * 60 * 1000;

export const loginExpectedBy = (submittedAt: string) =>
  new Date(Date.parse(submittedAt) + LOGIN_DELIVERY_MS).toISOString();

/** "INR 3,999": the PDF's built-in fonts have no rupee sign. */
const formatAmountPlain = (amount: number) =>
  `${payment.currency} ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;

/** Rows of the PDF receipt. */
export const receiptRows = (summary: TransactionSummary) => {
  const { labels } = receipt;
  return [
    { label: labels.status, value: receipt.status },
    { label: labels.plan, value: summary.planLabel },
    { label: labels.amount, value: formatAmountPlain(summary.amount) },
    { label: labels.reference, value: summary.reference },
    { label: labels.utr, value: summary.utr },
    { label: labels.paidTo, value: summary.payee.upiId },
    { label: labels.email, value: summary.email },
    { label: labels.phone, value: formatPhone(summary.phone) },
    { label: labels.screenshot, value: summary.screenshotName ?? receipt.noScreenshot },
    { label: labels.submitted, value: formatDateTime(summary.submittedAt) },
    { label: labels.loginBy, value: formatDateTime(loginExpectedBy(summary.submittedAt)) },
  ];
};

export const receiptFooter = () =>
  receipt.footer.map((line) => line.replace("{supportEmail}", payment.supportEmail));

/** Reads an uploaded image as a data URL, so it can be embedded in the PDF receipt. */
export const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const supportMailto = (subject: string, body: string) =>
  `mailto:${payment.supportEmail}?${toQuery({ subject, body })}`;
