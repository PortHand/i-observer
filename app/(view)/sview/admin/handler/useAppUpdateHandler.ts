"use client";

import { useState } from "react";
import { appUpdate } from "../content/adminContent";
import { parseAppUpdateForm, type AppUpdateField, type AppUpdateInput } from "../helper/appUpdateHelper";
import { saveAppUpdatePolicy, type AppUpdatePolicyView } from "../services/adminService";

export const useAppUpdateHandler = (initial: AppUpdatePolicyView, latestVersion: string) => {
  /** The policy as saved, for the status line. */
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState<AppUpdateInput>({
    forceUpdate: initial.forceUpdate,
    minimumVersion: initial.minimumVersion,
    message: initial.message ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<AppUpdateField, string>>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  /** The "Force everyone to update?" confirmation is open. */
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const change = <K extends keyof AppUpdateInput>(field: K, value: AppUpdateInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
  };

  const save = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await saveAppUpdatePolicy(form);
      if (!result.ok) {
        setErrors(result.fields ?? {});
        if (!result.fields) setError(result.error);
        return;
      }
      setSaved(result.policy);
      setMessage(appUpdate.saved);
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  /** Checks the form; turning force update on (or raising its minimum) asks for confirmation first. */
  const submit = () => {
    const parsed = parseAppUpdateForm(form, latestVersion);
    if (!parsed.ok) return setErrors(parsed.errors);
    const tightens = parsed.input.forceUpdate && (!saved.forceUpdate || saved.minimumVersion !== parsed.input.minimumVersion);
    if (tightens) return setConfirming(true);
    void save();
  };

  const cancel = () => {
    if (!submitting) setConfirming(false);
  };

  return { saved, form, change, errors, error, message, confirming, submitting, submit, save, cancel };
};
