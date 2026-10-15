// Data shared by the payment review emails (approved, rejected).

/** Feature name on the payment emails. Selects MAIL_BCC_PAYMENT in .env. */
export const PAYMENT_FEATURE = "payment";

export interface PaymentMailData {
  reference: string;
  /** e.g. "iOverlay Yearly · 12 months". */
  planLabel: string;
  /** e.g. "₹3,999". */
  amount: string;
  utr: string | null;
}

export interface PaymentVerifiedMailData extends PaymentMailData {
  username: string;
  password: string;
}
