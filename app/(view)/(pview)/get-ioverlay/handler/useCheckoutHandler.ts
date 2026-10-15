"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { checkout, type CheckoutStep } from "../content/getContent";
import {
  getPlan,
  isValidEmail,
  isValidPhone,
  isValidScreenshot,
  isValidUtr,
  normalizePhone,
  normalizeUtr,
  readAsDataUrl,
  ORDER_NOT_FOUND,
  type TransactionSummary,
  VERIFICATION_REQUIRED,
} from "../helper/getHelper";
import { receiptFileName, renderReceiptPdf } from "../helper/receiptPdf";
import * as getService from "../services/getService";

// Checkout keeps nothing in the browser: a reload starts again from step 1. These keys were used by
// earlier versions and are deleted on load so nothing lingers.
const LEGACY_STORAGE_KEYS = ["ioverlay.checkout", "ioverlay.checkout.screenshot"];

/** Email ownership proven with an emailed code; the token goes with createOrder. */
export interface VerifiedEmail {
  email: string;
  token: string;
}

/** Details typed in step 1, kept in memory so the form refills when going back from a later step. */
export interface ContactDraft {
  email: string;
  phone: string;
}

export type CopyTarget = "upi" | "reference";

/**
 * `plans` are the active plans from the database; there is always at least one. `initialPlanId`
 * is pre-selected when it's one of them, else the default plan.
 */
export const useCheckoutHandler = (plans: getService.Plan[], initialPlanId: getService.PlanId | null = null) => {
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [planId, setPlanId] = useState<getService.PlanId>(getPlan(plans, initialPlanId ?? "").id);
  const [order, setOrder] = useState<getService.Order | null>(null);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [verified, setVerified] = useState<VerifiedEmail | null>(null);
  /** When "Resend code" unlocks (ms since epoch), and a clock that ticks while it's locked. */
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  /** The OTP modal, and the error shown inside it (separate from the form's error). */
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  /** The uploaded payment screenshot as a data URL, for the PDF receipt. */
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) sessionStorage.removeItem(key);
    } catch {
      // Storage blocked: there's nothing to clean up then.
    }
  }, []);

  // Tick once a second while "Resend code" is locked, to show the countdown.
  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= resendAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const goTo = (next: CheckoutStep) => {
    setError("");
    setStep(next);
    // Bring the new step into view and focus its heading so screen readers announce it.
    requestAnimationFrame(() => {
      const heading = headingRef.current;
      heading?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      heading?.focus({ preventScroll: true });
    });
  };

  /**
   * Asks the server for a working code for `email`. The server decides from the otp table: it keeps
   * the latest code while it's active (nothing is emailed) or sends a new one once it has expired;
   * `resend` forces a new one. "Wait N seconds" on a resend still opens the modal, with the
   * countdown on "Resend code".
   */
  const sendCode = async (email: string, resend = false): Promise<{ error: string } | { sent: boolean }> => {
    const result = await getService.sendEmailOtp(email, resend);
    const resendAfter = result.ok ? result.resendAfter : result.retryAfter;
    if (!result.ok && resendAfter === undefined) return { error: result.fields?.email ?? result.error };
    setCodeSentTo(email);
    setResendAt(Date.now() + (resendAfter ?? 0) * 1000);
    setNow(Date.now());
    return { sent: result.ok && result.sent };
  };

  /** The order for the chosen plan. The server takes several plans per order; the form offers one for now. */
  const orderRequest = (contact: ContactDraft): getService.OrderRequest => ({
    items: [{ planId, quantity: 1 }],
    ...contact,
  });

  /**
   * Creates the order, or updates it when editing (same reference; the server re-prices it), then
   * shows the QR code. Returns false, without showing an error, when the server wants an OTP first.
   */
  const saveOrder = async (
    request: getService.OrderRequest,
    token: string | null,
    existing: getService.Order | null = order,
  ): Promise<boolean> => {
    const result = existing
      ? await getService.updateOrder(existing.reference, request, token)
      : await getService.createOrder(request, token);
    // The remembered order is gone (e.g. saved on an earlier visit, before a database reset): start a new one.
    if (!result.ok && result.code === ORDER_NOT_FOUND && existing) {
      setOrder(null);
      return saveOrder(request, token, null);
    }
    if (!result.ok && result.code === VERIFICATION_REQUIRED) return false;
    if (!result.ok) {
      setError(result.fields?.items ?? result.fields?.phone ?? result.fields?.email ?? result.error);
      return true;
    }
    setOrder(result.order);
    goTo("pay");
    return true;
  };

  /**
   * Step 1 submit ("Generate QR code"). The order is tried first: a verified email, or a returning
   * customer (account with this email and phone), goes straight to the QR code; an email or phone
   * registered to another account shows an error. For a new customer the server asks for an OTP, so
   * a code is emailed and the OTP modal opens.
   */
  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(data.get("phone") ?? ""));
    const { contact } = checkout;

    if (!isValidEmail(email)) return setError(contact.invalidEmail);
    if (!isValidPhone(phone)) return setError(contact.invalidPhone);

    setSubmitting(true);
    setError("");
    setDraft({ email, phone });
    try {
      const token = verified?.email === email ? verified.token : null;
      // Always ask the server first: it lets returning customers through and rejects an email or
      // phone registered to another account before any code is sent.
      if (await saveOrder(orderRequest({ email, phone }), token)) return;

      setOtpError("");
      setNotice("");
      // The server keeps an active code (nothing emailed) or sends a new one if it has expired.
      const outcome = await sendCode(email);
      if ("error" in outcome) return setError(outcome.error);
      setOtpOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  /** OTP modal submit: checks the code, then creates the order with the details from step 1. */
  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return setOtpOpen(false);
    const code = String(new FormData(event.currentTarget).get("code") ?? "").replace(/\D/g, "");
    if (code.length !== 6) return setOtpError(checkout.contact.invalidCode);

    setSubmitting(true);
    setOtpError("");
    setNotice("");
    try {
      const result = await getService.verifyEmailOtp(draft.email, code);
      if (!result.ok) return setOtpError(result.fields?.code ?? result.error);
      setVerified({ email: draft.email, token: result.token });
      setCodeSentTo(null);
      setOtpOpen(false);
      await saveOrder(orderRequest(draft), result.token);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!codeSentTo || resendIn > 0) return;
    setSubmitting(true);
    setOtpError("");
    setNotice("");
    try {
      const outcome = await sendCode(codeSentTo, true);
      if ("error" in outcome) setOtpError(outcome.error);
      else if (outcome.sent) setNotice(checkout.contact.codeResent);
    } finally {
      setSubmitting(false);
    }
  };

  /** Closes the modal. The code stays valid, so "Generate QR code" reopens it without sending another. */
  const handleCloseOtp = () => setOtpOpen(false);

  /** Closes the modal and selects the email field so a different address can be entered. */
  const handleChangeEmail = () => {
    setOtpOpen(false);
    setCodeSentTo(null);
    setNotice("");
    requestAnimationFrame(() => emailRef.current?.select());
  };

  const handleTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) return goTo("contact");
    const data = new FormData(event.currentTarget);
    const utr = normalizeUtr(String(data.get("utr") ?? ""));
    const file = data.get("screenshot");
    const screenshot = file instanceof File && file.size > 0 ? file : null;
    const { transaction } = checkout;

    if (!isValidUtr(utr)) return setError(transaction.invalidUtr);
    if (screenshot && !isValidScreenshot(screenshot)) return setError(transaction.invalidScreenshot);

    setSubmitting(true);
    setError("");
    try {
      const result = await getService.submitTransaction({ reference: order.reference, utr, screenshot });
      if (!result.ok) return setError(result.error);
      const dataUrl = screenshot ? await readAsDataUrl(screenshot).catch(() => null) : null;
      setScreenshotUrl(dataUrl);
      setSummary({ ...order, utr, submittedAt: result.submittedAt, screenshotName: screenshot?.name ?? null });
      goTo("done");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (target: CopyTarget, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked: the text is on screen to copy by hand.
    }
  };

  const handleDownload = async () => {
    if (!summary) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const url = URL.createObjectURL(await renderReceiptPdf(summary, screenshotUrl));
      const link = document.createElement("a");
      link.href = url;
      link.download = receiptFileName(summary.reference);
      link.click();
      // Give the browser a moment to start the download before releasing the file.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError(checkout.done.downloadFailed);
    } finally {
      setDownloading(false);
    }
  };

  return {
    step,
    planId,
    order,
    draft,
    codeSentTo,
    resendIn,
    notice,
    otpOpen,
    otpError,
    emailRef,
    summary,
    error,
    submitting,
    copied,
    downloading,
    downloadError,
    headingRef,
    goTo,
    setPlanId,
    handleContact,
    handleVerifyCode,
    handleResendCode,
    handleCloseOtp,
    handleChangeEmail,
    handleTransaction,
    handleCopy,
    handleDownload,
  };
};
