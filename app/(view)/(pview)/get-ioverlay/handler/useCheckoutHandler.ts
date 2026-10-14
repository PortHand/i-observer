"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { checkout, type CheckoutStep } from "../content/getContent";
import {
  defaultPlan,
  isValidEmail,
  isValidPhone,
  isValidScreenshot,
  isValidUtr,
  normalizePhone,
  normalizeUtr,
  readAsDataUrl,
  type TransactionSummary,
} from "../helper/getHelper";
import { receiptFileName, renderReceiptPdf } from "../helper/receiptPdf";
import * as getService from "../services/getService";

// Progress survives a reload: phones often reload the tab after switching to the UPI or email app.
const STORAGE_KEY = "ioverlay.checkout";
// Kept apart from the rest: a large screenshot may not fit in storage, and that's fine.
const SCREENSHOT_KEY = "ioverlay.checkout.screenshot";

/** Email ownership proven with an emailed code; the token goes with createOrder. */
export interface VerifiedEmail {
  email: string;
  token: string;
}

/** Details typed before the order exists, so the form refills after a reload while waiting for the code. */
export interface ContactDraft {
  email: string;
  phone: string;
}

interface SavedCheckout {
  step: CheckoutStep;
  order: getService.Order | null;
  summary: TransactionSummary | null;
  /** Email the latest verification code went to, while the code field is showing. */
  codeSentTo?: string | null;
  draft?: ContactDraft | null;
  verified?: VerifiedEmail | null;
}

const loadSaved = (): SavedCheckout | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as SavedCheckout) : null;
    // Progress saved before orders carried a fixed price and payee can't build a QR code, so start over.
    if ((saved?.order && !saved.order.payee?.upiId) || (saved?.summary && typeof saved.summary.amount !== "number")) return null;
    return saved;
  } catch {
    return null;
  }
};

const save = (state: SavedCheckout | null) => {
  try {
    if (state) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the flow still works, it just won't survive a reload.
  }
};

const saveScreenshot = (dataUrl: string | null) => {
  try {
    if (dataUrl) sessionStorage.setItem(SCREENSHOT_KEY, dataUrl);
    else sessionStorage.removeItem(SCREENSHOT_KEY);
  } catch {
    // Too large or storage blocked: the PDF still works until the page is reloaded.
  }
};

const loadScreenshot = () => {
  try {
    return sessionStorage.getItem(SCREENSHOT_KEY);
  } catch {
    return null;
  }
};

export type CopyTarget = "upi" | "reference";

/** `plans` are the active plans from the database; there is always at least one. */
export const useCheckoutHandler = (plans: getService.Plan[]) => {
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [planId, setPlanId] = useState<getService.PlanId>(defaultPlan(plans).id);
  const [order, setOrder] = useState<getService.Order | null>(null);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [verified, setVerified] = useState<VerifiedEmail | null>(null);
  /** When "Resend code" unlocks (ms since epoch), and a clock that ticks while it's locked. */
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  /** The uploaded payment screenshot as a data URL, for the PDF receipt. */
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const restored = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = loadSaved();
    restored.current = true;
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration.
    setOrder(saved.order);
    setCodeSentTo(saved.codeSentTo ?? null);
    setDraft(saved.draft ?? null);
    setVerified(saved.verified ?? null);
    if (saved.order) setPlanId(saved.order.planId);
    setSummary(saved.summary);
    if (saved.summary?.screenshotName) setScreenshotUrl(loadScreenshot());
    setStep(saved.step);
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    const empty = step === "contact" && !order && !codeSentTo && !verified;
    save(empty ? null : { step, order, summary, codeSentTo, draft, verified });
  }, [step, order, summary, codeSentTo, draft, verified]);

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

  /** Emails a code to `email` and shows the code field. Returns false if sending failed. */
  const sendCode = async (email: string) => {
    const result = await getService.sendEmailOtp(email);
    if (!result.ok) {
      setError(result.fields?.email ?? result.error);
      return false;
    }
    setCodeSentTo(email);
    setResendAt(Date.now() + result.resendAfter * 1000);
    setNow(Date.now());
    requestAnimationFrame(() => codeRef.current?.focus());
    return true;
  };

  /**
   * Step 1 submit. An email that isn't verified yet gets a code first; the next submit checks the
   * code and then creates the order. Editing an order only needs a code if the email changes.
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
    setNotice("");
    setDraft({ email, phone });
    try {
      let token = verified?.email === email ? verified.token : null;
      const needsCode = !token && order?.email !== email;

      if (needsCode && codeSentTo !== email) return void (await sendCode(email));
      if (needsCode) {
        const code = String(data.get("code") ?? "").replace(/\D/g, "");
        if (code.length !== 6) return setError(contact.invalidCode);
        const result = await getService.verifyEmailOtp(email, code);
        if (!result.ok) return setError(result.fields?.code ?? result.error);
        token = result.token;
        setVerified({ email, token });
        setCodeSentTo(null);
      }

      // Editing the plan or details of an existing order keeps its reference; the server re-prices it.
      const request = { planId, email, phone };
      const result = order
        ? await getService.updateOrder(order.reference, request, token)
        : await getService.createOrder(request, token);
      if (!result.ok) return setError(result.fields?.email ?? result.error);
      setOrder(result.order);
      goTo("pay");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!codeSentTo || resendIn > 0) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      if (await sendCode(codeSentTo)) setNotice(checkout.contact.codeResent);
    } finally {
      setSubmitting(false);
    }
  };

  /** Hides the code field so a different email can be entered. */
  const handleChangeEmail = () => {
    setCodeSentTo(null);
    setError("");
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
      const result = await getService.submitTransaction({ reference: order.reference, utr });
      if (!result.ok) return setError(result.error);
      const dataUrl = screenshot ? await readAsDataUrl(screenshot).catch(() => null) : null;
      setScreenshotUrl(dataUrl);
      saveScreenshot(dataUrl);
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
    /** True once the email in use is proven, so the submit button can skip the code step. */
    emailVerified: verified !== null || order !== null,
    codeRef,
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
    handleResendCode,
    handleChangeEmail,
    handleTransaction,
    handleCopy,
    handleDownload,
  };
};
