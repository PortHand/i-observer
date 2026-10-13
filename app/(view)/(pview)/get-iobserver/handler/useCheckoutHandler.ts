"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { checkout, defaultPlanId, type CheckoutStep, type PlanId } from "../content/getContent";
import {
  isValidEmail,
  isValidPhone,
  isValidScreenshot,
  isValidUtr,
  normalizePhone,
  normalizeUtr,
  summaryText,
  type TransactionSummary,
} from "../helper/getHelper";
import { receiptFileName, renderReceiptPng } from "../helper/receiptImage";
import * as getService from "../services/getService";

// Progress survives a reload: phones often reload the tab after switching to the UPI app.
const STORAGE_KEY = "iobserver.checkout";

interface SavedCheckout {
  step: CheckoutStep;
  order: getService.Order | null;
  summary: TransactionSummary | null;
}

const loadSaved = (): SavedCheckout | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCheckout) : null;
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

const subscribeNoop = () => () => {};
const detectShare = () => typeof navigator.share === "function";

export type CopyTarget = "upi" | "reference" | "summary";

export const useCheckoutHandler = () => {
  const canShare = useSyncExternalStore(subscribeNoop, detectShare, () => false);
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [planId, setPlanId] = useState<PlanId>(defaultPlanId);
  const [order, setOrder] = useState<getService.Order | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = loadSaved();
    restored.current = true;
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration.
    setOrder(saved.order);
    if (saved.order) setPlanId(saved.order.planId);
    setSummary(saved.summary);
    setStep(saved.step);
  }, []);

  useEffect(() => {
    if (restored.current) save(step === "contact" && !order ? null : { step, order, summary });
  }, [step, order, summary]);

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

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const phone = normalizePhone(String(data.get("phone") ?? ""));
    const { contact } = checkout;

    if (!isValidEmail(email)) return setError(contact.invalidEmail);
    if (!isValidPhone(phone)) return setError(contact.invalidPhone);

    // Editing the plan or details of an existing order keeps its reference.
    if (order) {
      setOrder({ ...order, planId, email, phone });
      return goTo("pay");
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await getService.createOrder({ planId, email, phone });
      if (!result.ok) return setError(result.error);
      setOrder(result.order);
      goTo("pay");
    } finally {
      setSubmitting(false);
    }
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

  const handleShare = async () => {
    if (!summary) return;
    const text = summaryText(summary);
    try {
      await navigator.share({ title: checkout.done.title, text });
    } catch (shareError) {
      // Cancelling the share sheet is not an error; anything else falls back to copying.
      if ((shareError as Error).name !== "AbortError") await handleCopy("summary", text);
    }
  };

  const handleDownload = async () => {
    if (!summary) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const url = URL.createObjectURL(await renderReceiptPng(summary));
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

  const handleStartOver = () => {
    setOrder(null);
    setPlanId(defaultPlanId);
    setSummary(null);
    goTo("contact");
  };

  return {
    step,
    planId,
    order,
    summary,
    error,
    submitting,
    copied,
    downloading,
    downloadError,
    canShare,
    headingRef,
    goTo,
    setPlanId,
    handleContact,
    handleTransaction,
    handleCopy,
    handleShare,
    handleDownload,
    handleStartOver,
  };
};
