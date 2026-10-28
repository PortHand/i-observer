"use client";

import { useState } from "react";
import { offerTimerPage } from "../content/adminContent";
import { formatIst } from "../helper/adminHelper";
import { parseOfferTimerForm, toOfferTimerInput, type OfferTimerField, type OfferTimerInput } from "../helper/offerTimerHelper";
import { saveOfferTimer, type OfferTimerView } from "../services/adminService";

export const useOfferTimerHandler = (initial: OfferTimerView) => {
  /** The timer as saved, for the status line. */
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState<OfferTimerInput>(() => toOfferTimerInput(initial));
  const [errors, setErrors] = useState<Partial<Record<OfferTimerField, string>>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  /** The "Reset the timer?" confirmation is open. */
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const change = <K extends keyof OfferTimerInput>(field: K, value: OfferTimerInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
  };

  const save = async (reset: boolean) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await saveOfferTimer(form, reset);
      if (!result.ok) {
        setErrors(result.fields ?? {});
        if (!result.fields) setError(result.error);
        setConfirmingReset(false);
        return;
      }
      setSaved(result.timer);
      // The form shows the end time the server set, e.g. after a reset.
      setForm(toOfferTimerInput(result.timer));
      setMessage(reset && result.timer.endsAt ? offerTimerPage.resetDone.replace("{date}", formatIst(result.timer.endsAt)) : offerTimerPage.saved);
      setConfirmingReset(false);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => {
    const parsed = parseOfferTimerForm(form, { reset: false, now: Date.now() });
    if (!parsed.ok) return setErrors(parsed.errors);
    void save(false);
  };

  /** Checks everything but the end time, then asks before restarting the countdown. */
  const askReset = () => {
    setMessage("");
    const parsed = parseOfferTimerForm(form, { reset: true, now: Date.now() });
    if (!parsed.ok) return setErrors(parsed.errors);
    setErrors({});
    setConfirmingReset(true);
  };

  const cancelReset = () => {
    if (!submitting) setConfirmingReset(false);
  };

  return { saved, form, change, errors, error, message, confirmingReset, submitting, submit, askReset, reset: () => save(true), cancelReset };
};
