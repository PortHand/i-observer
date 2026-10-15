"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { review } from "../content/adminContent";
import { reviewOrder, type ReviewAction } from "../services/adminService";

export const useReviewHandler = (reference: string) => {
  const router = useRouter();
  /** The action whose confirmation is open, if any. */
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState(false);

  const open = (next: ReviewAction) => {
    setAction(next);
    setError("");
  };

  const close = () => {
    if (submitting) return;
    setAction(null);
    setError("");
  };

  const confirm = async () => {
    if (!action) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await reviewOrder(reference, action, note);
      if (!result.ok) return setError(result.fields?.note ?? result.error);
      const { emailed } = result.outcome;
      setMessage(review.done[action] + (emailed === null ? "" : emailed ? review.emailed : review.emailFailed));
      setWarning(emailed === false);
      setAction(null);
      setNote("");
      // Re-render the server page with the order's new status and actions.
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return { action, note, setNote, submitting, error, message, warning, open, close, confirm };
};
